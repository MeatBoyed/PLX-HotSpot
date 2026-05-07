using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<Site> Sites { get; set; }
        public DbSet<Branding> Brandings { get; set; }
        public DbSet<BrandingImage> BrandingImages { get; set; }
        public DbSet<AdsConfig> AdsConfigs { get; set; }
        public DbSet<Package> Packages { get; set; }
        public DbSet<OtpVerification> OtpVerifications { get; set; }
        public DbSet<MarketingSubmission> MarketingSubmissions { get; set; }
        public DbSet<RadiusConfig> RadiusConfigs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
            base.OnModelCreating(modelBuilder);
        }
    }
}
