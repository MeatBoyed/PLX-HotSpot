using AuraConnect.Core.Entities;
using AuraConnect.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AuraConnect.Infrastructure.Data.Configurations
{
    public class ProfileConfiguration : IEntityTypeConfiguration<Profile>
    {
        public void Configure(EntityTypeBuilder<Profile> builder)
        {
            builder.ToTable("profiles");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Id)
                .HasColumnName("id")
                .HasMaxLength(32);

            builder.Property(p => p.IdentityUserId)
                .HasColumnName("identity_user_id")
                .IsRequired()
                .HasMaxLength(450);

            builder.Property(p => p.FirstName)
                .HasColumnName("first_name")
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(p => p.LastName)
                .HasColumnName("last_name")
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(p => p.PhoneNumber)
                .HasColumnName("phone_number")
                .HasMaxLength(20);

            builder.Property(p => p.BlnkIdentityId)
                .HasColumnName("blnk_identity_id")
                .HasMaxLength(255);

            builder.Property(p => p.BlnkWalletId)
                .HasColumnName("blnk_wallet_id")
                .HasMaxLength(255);

            builder.Property(p => p.Status)
                .HasColumnName("status")
                .HasConversion<int>()
                .HasDefaultValue(ProfileStatus.Active);

            builder.Property(p => p.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(p => p.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Ignore(p => p.DisplayName);

            builder.HasIndex(p => p.IdentityUserId).IsUnique();

            builder.HasOne<ApplicationUser>()
                .WithOne(u => u.Profile)
                .HasForeignKey<Profile>(p => p.IdentityUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(p => p.SiteMemberships)
                .WithOne(m => m.Profile)
                .HasForeignKey(m => m.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
