using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Infrastructure.Data.Configurations
{
    public class AdsConfigConfiguration : IEntityTypeConfiguration<AdsConfig>
    {
        public void Configure(EntityTypeBuilder<AdsConfig> builder)
        {
            builder.ToTable("ads_config");

            builder.HasKey(a => a.SiteId);

            builder.Property(a => a.SiteId)
                .HasColumnName("site_id")
                .HasMaxLength(32)
                .IsRequired();

            builder.Property(a => a.ReviveServerUrl)
                .HasColumnName("revive_server_url")
                .HasMaxLength(255);

            builder.Property(a => a.ReviveZoneId)
                .HasColumnName("revive_zone_id")
                .HasMaxLength(255);

            builder.Property(a => a.ReviveId)
                .HasColumnName("revive_id")
                .HasMaxLength(255);

            builder.Property(a => a.VastUrl)
                .HasColumnName("vast_url")
                .HasMaxLength(255);

            builder.Property(a => a.IsEnabled)
                .HasColumnName("is_enabled")
                .HasDefaultValue(true);

            builder.Property(a => a.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(a => a.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}
