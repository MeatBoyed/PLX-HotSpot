using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Infrastructure.Data.Configurations
{
    public class OtpVerificationConfiguration : IEntityTypeConfiguration<OtpVerification>
    {
        public void Configure(EntityTypeBuilder<OtpVerification> builder)
        {
            builder.ToTable("otp_verifications");

            builder.HasKey(o => o.Id);
            builder.HasIndex(o => new { o.SiteId, o.Msisdn, o.Verified });
            builder.HasIndex(o => o.ExpiresAt);

            builder.Property(o => o.Id)
                .HasColumnName("id")
                .HasMaxLength(32);

            builder.Property(o => o.SiteId)
                .HasColumnName("site_id")
                .IsRequired()
                .HasMaxLength(32);

            builder.Property(o => o.Msisdn)
                .HasColumnName("msisdn")
                .IsRequired()
                .HasMaxLength(15);

            builder.Property(o => o.OtpCode)
                .HasColumnName("otp_code")
                .IsRequired()
                .HasMaxLength(6);

            builder.Property(o => o.Attempts)
                .HasColumnName("attempts")
                .HasDefaultValue(0);

            builder.Property(o => o.Verified)
                .HasColumnName("verified")
                .HasDefaultValue(false);

            builder.Property(o => o.IpAddress)
                .HasColumnName("ip_address")
                .HasMaxLength(45);

            builder.Property(o => o.UserAgent)
                .HasColumnName("user_agent")
                .HasMaxLength(512);

            builder.Property(o => o.MacAddress)
                .HasColumnName("mac_address")
                .HasMaxLength(17);

            builder.Property(o => o.ExpiresAt)
                .HasColumnName("expires_at");

            builder.Property(o => o.VerifiedAt)
                .HasColumnName("verified_at");

            builder.Property(o => o.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}
