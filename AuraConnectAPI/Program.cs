using AuraConnect.Application.Interfaces;
using AuraConnect.Application.Services;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure;
using AuraConnect.Infrastructure.Data;
using AuraConnect.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

// OpenAPI / Swagger for API documentation and testing. Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

// Add Context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Repositories and Services
builder.Services.AddScoped<ITenantRepository, TenantRepository>();
builder.Services.AddScoped<ITenantService, TenantService>();
builder.Services.AddScoped<ISiteRepository, SiteRepository>();
builder.Services.AddScoped<ISiteService, SiteService>();
builder.Services.AddScoped<IBrandingRepository, BrandingRepository>();
builder.Services.AddScoped<IBrandingService, BrandingService>();
builder.Services.AddScoped<IAdsConfigRepository, AdsConfigRepository>();
builder.Services.AddScoped<IAdsConfigService, AdsConfigService>();

builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// Test database connection on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        await dbContext.Database.CanConnectAsync();
        Console.WriteLine("✅ Database connection successful!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database connection failed: {ex.Message}");
        throw;
    }
}

app.Run();
