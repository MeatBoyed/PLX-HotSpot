using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AuraConnect.Infrastructure.Data.Configurations
{
    public class UserPackageConfiguration : IEntityTypeConfiguration<UserPackage>
    {
        public void Configure(EntityTypeBuilder<UserPackage> builder)
        {
            builder.ToTable("user_packages");
            builder.HasKey(u => u.Id);
            builder.Property(u => u.Id).HasMaxLength(32);
            builder.Property(u => u.ProfileId).IsRequired().HasMaxLength(32).HasColumnName("profile_id");
            builder.Property(u => u.PackageId).IsRequired().HasMaxLength(32).HasColumnName("package_id");
            builder.Property(u => u.SiteId).IsRequired().HasMaxLength(32).HasColumnName("site_id");
            builder.Property(u => u.BlnkTransactionId).IsRequired().HasMaxLength(255).HasColumnName("blnk_transaction_id");
            builder.Property(u => u.Status).HasColumnName("status");
            builder.Property(u => u.PurchasedAt).HasColumnName("purchased_at");
            builder.Property(u => u.ExpiresAt).HasColumnName("expires_at");

            builder.HasOne(u => u.Profile)
                .WithMany()
                .HasForeignKey(u => u.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(u => u.ProfileId).HasDatabaseName("ix_user_packages_profile_id");
            builder.HasIndex(u => new { u.ProfileId, u.SiteId }).HasDatabaseName("ix_user_packages_profile_site");
        }
    }
}
