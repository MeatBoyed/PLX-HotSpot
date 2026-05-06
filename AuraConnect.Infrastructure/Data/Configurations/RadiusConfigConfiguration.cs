using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

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

            builder.Property(r => r.Host)
                .HasColumnName("host")
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(r => r.Port)
                .HasColumnName("port")
                .HasDefaultValue(1812);

            builder.Property(r => r.Secret)
                .HasColumnName("secret")
                .IsRequired()
                .HasColumnType("text");

            builder.Property(r => r.NasIdentifier)
                .HasColumnName("nas_identifier")
                .HasMaxLength(255);

            builder.Property(r => r.Realm)
                .HasColumnName("realm")
                .HasMaxLength(255);

            builder.Property(r => r.AcctPort)
                .HasColumnName("acct_port")
                .HasDefaultValue(1813);

            builder.Property(r => r.TimeoutMs)
                .HasColumnName("timeout_ms")
                .HasDefaultValue(5000);

            builder.Property(r => r.Retries)
                .HasColumnName("retries")
                .HasDefaultValue(3);

            builder.Property(r => r.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(r => r.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}
