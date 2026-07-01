using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Infrastructure.Data.Configurations
{
    public class MarketingSubmissionConfiguration : IEntityTypeConfiguration<MarketingSubmission>
    {
        public void Configure(EntityTypeBuilder<MarketingSubmission> builder)
        {
            builder.ToTable("marketing_submissions");

            builder.HasKey(m => m.Id);
            builder.HasIndex(m => new { m.SiteId, m.Email }).IsUnique();
            builder.HasIndex(m => new { m.SiteId, m.Unsubscribed });

            builder.Property(m => m.Id)
                .HasColumnName("id")
                .HasMaxLength(32);

            builder.Property(m => m.SiteId)
                .HasColumnName("site_id")
                .IsRequired()
                .HasMaxLength(32);

            builder.Property(m => m.Email)
                .HasColumnName("email")
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(m => m.Agreed)
                .HasColumnName("agreed")
                .HasDefaultValue(true);

            builder.Property(m => m.IpAddress)
                .HasColumnName("ip_address")
                .HasMaxLength(45);

            builder.Property(m => m.UserAgent)
                .HasColumnName("user_agent")
                .HasMaxLength(512);

            builder.Property(m => m.MacAddress)
                .HasColumnName("mac_address")
                .HasMaxLength(17);

            builder.Property(m => m.Unsubscribed)
                .HasColumnName("unsubscribed")
                .HasDefaultValue(false);

            builder.Property(m => m.UnsubscribedAt)
                .HasColumnName("unsubscribed_at");

            builder.Property(m => m.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
    }
