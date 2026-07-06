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

            builder.Property(p => p.RadiusProfileId)
                .HasColumnName("radius_profile_id");

            builder.Property(p => p.IsActive)
                .HasColumnName("is_active")
                .HasDefaultValue(true);

            builder.Property(p => p.SortOrder)
                .HasColumnName("sort_order")
                .HasDefaultValue(0);

            builder.Property(p => p.DurationDays)
                .HasColumnName("duration_days")
                .HasDefaultValue(0);

            // Data limits
            builder.Property(p => p.DataLimitEnabled).HasColumnName("data_limit_enabled").HasDefaultValue(false);
            builder.Property(p => p.DataAmount).HasColumnName("data_amount");
            builder.Property(p => p.DataUnit).HasColumnName("data_unit").HasMaxLength(10);
            builder.Property(p => p.DataReset).HasColumnName("data_reset").HasMaxLength(20);
            builder.Property(p => p.DataCap).HasColumnName("data_cap").HasMaxLength(10);

            // Time limits
            builder.Property(p => p.TimeLimitEnabled).HasColumnName("time_limit_enabled").HasDefaultValue(false);
            builder.Property(p => p.TimeAmount).HasColumnName("time_amount");
            builder.Property(p => p.TimeUnit).HasColumnName("time_unit").HasMaxLength(10);
            builder.Property(p => p.TimeReset).HasColumnName("time_reset").HasMaxLength(20);
            builder.Property(p => p.TimeCap).HasColumnName("time_cap").HasMaxLength(10);

            // Speed limits
            builder.Property(p => p.SpeedLimitEnabled).HasColumnName("speed_limit_enabled").HasDefaultValue(false);
            builder.Property(p => p.SpeedUploadAmount).HasColumnName("speed_upload_amount");
            builder.Property(p => p.SpeedUploadUnit).HasColumnName("speed_upload_unit").HasMaxLength(10);
            builder.Property(p => p.SpeedDownloadAmount).HasColumnName("speed_download_amount");
            builder.Property(p => p.SpeedDownloadUnit).HasColumnName("speed_download_unit").HasMaxLength(10);

            // Session limits
            builder.Property(p => p.SessionLimitEnabled).HasColumnName("session_limit_enabled").HasDefaultValue(false);
            builder.Property(p => p.SessionLimit).HasColumnName("session_limit");

            builder.Property(p => p.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(p => p.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
    }
