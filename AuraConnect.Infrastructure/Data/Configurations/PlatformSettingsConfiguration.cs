using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AuraConnect.Infrastructure.Data.Configurations
{
    public class PlatformSettingsConfiguration : IEntityTypeConfiguration<PlatformSettings>
    {
        public void Configure(EntityTypeBuilder<PlatformSettings> builder)
        {
            builder.ToTable("platform_settings");
            builder.HasKey(p => p.Id);

            builder.Property(p => p.Id)
                .HasColumnName("id")
                .HasMaxLength(32);

            builder.Property(p => p.PayFastMerchantId)
                .HasColumnName("payfast_merchant_id")
                .HasMaxLength(255);

            builder.Property(p => p.PayFastMerchantKey)
                .HasColumnName("payfast_merchant_key")
                .HasMaxLength(255);

            builder.Property(p => p.PayFastPassPhrase)
                .HasColumnName("payfast_pass_phrase")
                .HasMaxLength(255);

            builder.Property(p => p.PayFastSandboxMode)
                .HasColumnName("payfast_sandbox_mode")
                .HasDefaultValue(true);

            builder.Property(p => p.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(p => p.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}
