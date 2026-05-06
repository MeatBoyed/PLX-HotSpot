using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Infrastructure.Data.Configurations
{
    public class PackageConfiguration : IEntityTypeConfiguration<Package>
    {
        public void Configure(EntityTypeBuilder<Package> builder)
        {
            builder.ToTable("packages");

            builder.HasKey(p => p.Id);
            builder.HasIndex(p => new { p.SiteId, p.Name }).IsUnique();

            builder.Property(p => p.Id)
                .HasColumnName("id")
                .HasMaxLength(32);

            builder.Property(p => p.SiteId)
                .HasColumnName("site_id")
                .IsRequired()
                .HasMaxLength(32);

            builder.Property(p => p.Name)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(p => p.Description)
                .HasColumnName("description")
                .HasMaxLength(255);

            builder.Property(p => p.Price)
                .HasColumnName("price")
                .HasColumnType("decimal(10,2)");

            builder.Property(p => p.RadiusProfile)
                .HasColumnName("radius_profile")
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(p => p.RadiusRealmId)
                .HasColumnName("radius_realm_id")
                .HasMaxLength(255);

            builder.Property(p => p.RadiusCloudId)
                .HasColumnName("radius_cloud_id")
                .HasMaxLength(255);

            builder.Property(p => p.RadiusProfileId)
                .HasColumnName("radius_profile_id");

            builder.Property(p => p.IsActive)
                .HasColumnName("is_active")
                .HasDefaultValue(true);

            builder.Property(p => p.SortOrder)
                .HasColumnName("sort_order")
                .HasDefaultValue(0);

            builder.Property(p => p.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(p => p.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
    }
