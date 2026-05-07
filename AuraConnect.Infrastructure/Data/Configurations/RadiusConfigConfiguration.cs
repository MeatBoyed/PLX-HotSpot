using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AuraConnect.Infrastructure.Data.Configurations
{
    public class RadiusConfigConfiguration : IEntityTypeConfiguration<RadiusConfig>
    {
        public void Configure(EntityTypeBuilder<RadiusConfig> builder)
        {
            builder.ToTable("radius_config");

            builder.HasKey(r => r.SiteId);

            builder.Property(r => r.SiteId)
                .HasColumnName("site_id")
                .HasMaxLength(32)
                .IsRequired();

            builder.Property(r => r.GatewayUrl)
                .HasColumnName("gateway_url")
                .HasMaxLength(500);

            builder.Property(r => r.FreeUsername)
                .HasColumnName("free_username")
                .HasMaxLength(255);

            builder.Property(r => r.FreePassword)
                .HasColumnName("free_password")
                .HasMaxLength(255);

            builder.Property(r => r.RadiusDeskUrl)
                .HasColumnName("radiusdesk_url")
                .HasMaxLength(500);

            builder.Property(r => r.RadiusDeskApiToken)
                .HasColumnName("radiusdesk_api_token")
                .HasColumnType("text");

            builder.Property(r => r.RadiusDeskRealmId)
                .HasColumnName("radiusdesk_realm_id")
                .HasMaxLength(255);

            builder.Property(r => r.RadiusDeskCloudId)
                .HasColumnName("radiusdesk_cloud_id")
                .HasMaxLength(255);

            builder.Property(r => r.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(r => r.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}
