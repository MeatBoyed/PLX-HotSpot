using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AuraConnect.Infrastructure.Data.Configurations
{
    public class SiteMembershipConfiguration : IEntityTypeConfiguration<SiteMembership>
    {
        public void Configure(EntityTypeBuilder<SiteMembership> builder)
        {
            builder.ToTable("site_memberships");

            builder.HasKey(m => m.Id);

            builder.Property(m => m.Id)
                .HasColumnName("id")
                .HasMaxLength(32);

            builder.Property(m => m.ProfileId)
                .HasColumnName("profile_id")
                .IsRequired()
                .HasMaxLength(32);

            builder.Property(m => m.SiteId)
                .HasColumnName("site_id")
                .IsRequired()
                .HasMaxLength(32);

            builder.Property(m => m.TenantId)
                .HasColumnName("tenant_id")
                .IsRequired()
                .HasMaxLength(32);

            builder.Property(m => m.FirstVisitAt)
                .HasColumnName("first_visit_at");

            builder.Property(m => m.LastVisitAt)
                .HasColumnName("last_visit_at");

            builder.HasIndex(m => new { m.ProfileId, m.SiteId }).IsUnique();
            builder.HasIndex(m => m.TenantId);

            builder.HasOne(m => m.Site)
                .WithMany()
                .HasForeignKey(m => m.SiteId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
