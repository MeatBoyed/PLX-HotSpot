using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Infrastructure.Data.Configurations
{
    internal class SiteConfiguration : IEntityTypeConfiguration<Site>
    {
        public void Configure(EntityTypeBuilder<Site> builder)
        {
            builder.ToTable("sites");

            builder.HasKey(s => s.Id);
            builder.HasIndex(s => s.Ssid).IsUnique();
            builder.HasIndex(s => s.Domain).IsUnique();

            builder.Property(s => s.Id)
                .HasColumnName("id")
                .HasMaxLength(32);

            builder.Property(s => s.TenantId)
                .HasColumnName("tenant_id")
                .IsRequired()
                .HasMaxLength(32);

            builder.Property(s => s.Ssid)
                .HasColumnName("ssid")
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(s => s.Name)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(s => s.Domain)
                .HasColumnName("domain")
                .HasMaxLength(255);

            builder.Property(s => s.Status)
                .HasColumnName("status")
                .HasConversion<int>()
                .HasDefaultValue(SiteStatus.Active);

            builder.Property(s => s.SortOrder)
                .HasColumnName("sort_order")
                .HasDefaultValue(0);

            builder.Property(s => s.AuthMethods)
                .HasColumnName("auth_methods")
                .HasColumnType("text[]");

            builder.Property(s => s.MarketingOptIn)
                .HasColumnName("marketing_opt_in")
                .HasDefaultValue(false);

            builder.Property(s => s.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(s => s.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // One-to-one relationships
            builder.HasOne(s => s.Branding)
                .WithOne(b => b.Site)
                .HasForeignKey<Branding>(b => b.SiteId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.AdsConfig)
                .WithOne(a => a.Site)
                .HasForeignKey<AdsConfig>(a => a.SiteId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.RadiusConfig)
                .WithOne(r => r.Site)
                .HasForeignKey<RadiusConfig>(r => r.SiteId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(s => s.Packages)
                .WithOne(p => p.Site)
                .HasForeignKey(p => p.SiteId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
