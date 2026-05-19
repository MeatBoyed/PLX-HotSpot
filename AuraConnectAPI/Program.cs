using AuraConnect.Application.Interfaces;
using AuraConnect.Application.Services;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure;
using AuraConnect.Infrastructure.Data;
using AuraConnect.Infrastructure.Identity;
using AuraConnect.Infrastructure.Repositories;
using AuraConnect.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Serilog;
using System.Text;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    // CORS — origins configured via AllowedOrigins array + optional AllowedDomainSuffix for wildcard subdomain support
    var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
    var allowedDomainSuffix = builder.Configuration["AllowedDomainSuffix"];

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("PortalCors", policy =>
        {
            policy.SetIsOriginAllowed(origin =>
            {
                if (allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase)) return true;
                if (!string.IsNullOrWhiteSpace(allowedDomainSuffix))
                {
                    try { return new Uri(origin).Host.EndsWith(allowedDomainSuffix, StringComparison.OrdinalIgnoreCase); }
                    catch { return false; }
                }
                return false;
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        });
    });

    // Trust X-Forwarded-Proto from the reverse proxy so Request.Scheme is "https" behind TLS termination
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        options.KnownNetworks.Clear();
        options.KnownProxies.Clear();
    });

    builder.Services.AddMemoryCache();
    builder.Services.AddControllers();
    builder.Services.AddOpenApi();
    builder.Services.AddEndpointsApiExplorer();

    // ASP.NET Identity — core only, no cookie middleware
    builder.Services.AddIdentityCore<ApplicationUser>(options =>
    {
        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.User.RequireUniqueEmail = true;
        options.SignIn.RequireConfirmedEmail = false;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        options.Lockout.MaxFailedAccessAttempts = 5;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

    // JWT Bearer authentication
    var jwtSecret = builder.Configuration["Jwt:Secret"]
        ?? throw new InvalidOperationException("Jwt:Secret is not configured");
    var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "AuraConnect";
    var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "AuraConnect";

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,
                ValidateAudience = true,
                ValidAudience = jwtAudience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

    builder.Services.AddAuthorization();

    // Repositories
    builder.Services.AddScoped<ITenantRepository, TenantRepository>();
    builder.Services.AddScoped<ISiteRepository, SiteRepository>();
    builder.Services.AddScoped<IBrandingRepository, BrandingRepository>();
    builder.Services.AddScoped<IAdsConfigRepository, AdsConfigRepository>();
    builder.Services.AddScoped<IRadiusConfigRepository, RadiusConfigRepository>();
    builder.Services.AddScoped<IProfileRepository, ProfileRepository>();
    builder.Services.AddScoped<ISiteMembershipRepository, SiteMembershipRepository>();
    builder.Services.AddScoped<IPackageRepository, PackageRepository>();
    builder.Services.AddScoped<IUserPackageRepository, UserPackageRepository>();
    builder.Services.AddScoped<IWalletTransactionRepository, WalletTransactionRepository>();
    builder.Services.AddScoped<IPlatformSettingsRepository, PlatformSettingsRepository>();

    // Wallet / payment services
    builder.Services.AddScoped<IPayFastService, PayFastService>();
    builder.Services.AddScoped<IWalletService, WalletService>();

    // Services
    builder.Services.AddScoped<ITenantService, TenantService>();
    builder.Services.AddScoped<ISiteService, SiteService>();
    builder.Services.AddScoped<IBrandingService, BrandingService>();
    builder.Services.AddScoped<IAdsConfigService, AdsConfigService>();
    builder.Services.AddScoped<IRadiusConfigService, RadiusConfigService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IAdminProfileService, AdminProfileService>();
    builder.Services.AddScoped<IPackageService, PackageService>();
    builder.Services.AddScoped<IPlatformSettingsService, PlatformSettingsService>();
    builder.Services.AddScoped<IRadiusProvisioningService, RadiusProvisioningService>();
    builder.Services.AddSingleton<IPortalCacheService, PortalCacheService>();

    builder.Services.AddInfrastructure(builder.Configuration);

    var app = builder.Build();

    app.UseForwardedHeaders();

    app.MapOpenApi();
    app.MapScalarApiReference();

    app.UseSerilogRequestLogging();
    app.UseCors("PortalCors");
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    // Migrate DB and seed roles on startup
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        try
        {
            await dbContext.Database.MigrateAsync();
            Log.Information("Database migrations applied successfully");
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Database migration failed");
            throw;
        }

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        if (!await roleManager.RoleExistsAsync("User"))
        {
            await roleManager.CreateAsync(new IdentityRole("User"));
            Log.Information("Seeded role: User");
        }

    }

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed to start");
}
finally
{
    Log.CloseAndFlush();
}
