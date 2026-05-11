using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AuraConnect.Infrastructure.Data.Configurations
{
    public class WalletTransactionConfiguration : IEntityTypeConfiguration<WalletTransaction>
    {
        public void Configure(EntityTypeBuilder<WalletTransaction> builder)
        {
            builder.ToTable("wallet_transactions");
            builder.HasKey(w => w.Id);
            builder.Property(w => w.Id).HasMaxLength(32);
            builder.Property(w => w.ProfileId).IsRequired().HasMaxLength(32).HasColumnName("profile_id");
            builder.Property(w => w.BlnkTransactionId).HasMaxLength(255).HasColumnName("blnk_transaction_id");
            builder.Property(w => w.Type).HasColumnName("type");
            builder.Property(w => w.Amount).HasColumnType("decimal(18,2)").HasColumnName("amount");
            builder.Property(w => w.Currency).IsRequired().HasMaxLength(10).HasColumnName("currency");
            builder.Property(w => w.Reference).IsRequired().HasMaxLength(255).HasColumnName("reference");
            builder.Property(w => w.Status).IsRequired().HasMaxLength(50).HasColumnName("status");
            builder.Property(w => w.CreatedAt).HasColumnName("created_at");

            builder.HasOne(w => w.Profile)
                .WithMany()
                .HasForeignKey(w => w.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(w => w.Reference).IsUnique().HasDatabaseName("ix_wallet_transactions_reference");
            builder.HasIndex(w => w.ProfileId).HasDatabaseName("ix_wallet_transactions_profile_id");
        }
    }
}
