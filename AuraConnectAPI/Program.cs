using AuraConnect.Application.Interfaces;
using AuraConnect.Application.Services;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure;
using AuraConnect.Infrastructure.Data;
using AuraConnect.Infrastructure.Identity;
using AuraConnect.Infrastructure.Repositories;
using AuraConnect.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Serilog;

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

    builder.Services.AddMemoryCache();
    builder.Services.AddControllers();
    builder.Services.AddOpenApi();
    builder.Services.AddEndpointsApiExplorer();

    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

    // ASP.NET Identity
    builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
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
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

    // Cookie — HTTP-only, cross-origin friendly, returns 401/403 instead of redirect
    builder.Services.ConfigureApplicationCookie(options =>
    {
        options.Cookie.Name = "AuraConnect.Auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.None;
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest
            : CookieSecurePolicy.Always;
        options.ExpireTimeSpan = TimeSpan.FromDays(7);
        options.SlidingExpiration = true;
        options.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = 401; return Task.CompletedTask; };
        options.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = 403; return Task.CompletedTask; };
    });

    // Repositories
    builder.Services.AddScoped<ITenantRepository, TenantRepository>();
    builder.Services.AddScoped<ISiteRepository, SiteRepository>();
    builder.Services.AddScoped<IBrandingRepository, BrandingRepository>();
    builder.Services.AddScoped<IAdsConfigRepository, AdsConfigRepository>();
    builder.Services.AddScoped<IRadiusConfigRepository, RadiusConfigRepository>();
    builder.Services.AddScoped<IProfileRepository, ProfileRepository>();
    builder.Services.AddScoped<ISiteMembershipRepository, SiteMembershipRepository>();

    // Services
    builder.Services.AddScoped<ITenantService, TenantService>();
    builder.Services.AddScoped<ISiteService, SiteService>();
    builder.Services.AddScoped<IBrandingService, BrandingService>();
    builder.Services.AddScoped<IAdsConfigService, AdsConfigService>();
    builder.Services.AddScoped<IRadiusConfigService, RadiusConfigService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IRadiusProvisioningService, RadiusProvisioningService>();
    builder.Services.AddSingleton<IPortalCacheService, PortalCacheService>();

    builder.Services.AddInfrastructure(builder.Configuration);

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
    }

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
