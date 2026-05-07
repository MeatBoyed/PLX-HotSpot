using AuraConnect.Application.Interfaces;
using AuraConnect.Application.Services;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure;
using AuraConnect.Infrastructure.Data;
using AuraConnect.Infrastructure.Repositories;
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

    builder.Services.AddControllers();

    builder.Services.AddOpenApi();
    builder.Services.AddEndpointsApiExplorer();

    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

    builder.Services.AddScoped<ITenantRepository, TenantRepository>();
    builder.Services.AddScoped<ITenantService, TenantService>();
    builder.Services.AddScoped<ISiteRepository, SiteRepository>();
    builder.Services.AddScoped<ISiteService, SiteService>();
    builder.Services.AddScoped<IBrandingRepository, BrandingRepository>();
    builder.Services.AddScoped<IBrandingService, BrandingService>();
    builder.Services.AddScoped<IAdsConfigRepository, AdsConfigRepository>();
    builder.Services.AddScoped<IAdsConfigService, AdsConfigService>();
    builder.Services.AddScoped<IRadiusConfigRepository, RadiusConfigRepository>();
    builder.Services.AddScoped<IRadiusConfigService, RadiusConfigService>();

    builder.Services.AddInfrastructure(builder.Configuration);

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
    }

    app.UseSerilogRequestLogging();

    app.UseHttpsRedirection();
    app.UseAuthorization();
    app.MapControllers();

    // Apply pending EF Core migrations on startup
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
