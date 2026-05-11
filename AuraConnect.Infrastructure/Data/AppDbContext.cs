using AuraConnect.Core.Entities;
using AuraConnect.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AuraConnect.Infrastructure.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
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
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<SiteMembership> SiteMemberships { get; set; }
        public DbSet<UserPackage> UserPackages { get; set; }
        public DbSet<WalletTransaction> WalletTransactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // Identity tables first
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
    }
}
