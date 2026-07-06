using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AuraConnect.Infrastructure.Data.Configurations
{
    public class BrandingImageConfiguration : IEntityTypeConfiguration<BrandingImage>
    {
        public void Configure(EntityTypeBuilder<BrandingImage> builder)
        {
            builder.ToTable("branding_images");

            builder.HasKey(i => i.Id);

            builder.Property(i => i.Id)
                .HasColumnName("id")
                .UseIdentityColumn();

            builder.Property(i => i.SiteId)
                .HasColumnName("site_id")
                .HasMaxLength(32)
                .IsRequired();

            builder.Property(i => i.ImageType)
                .HasColumnName("image_type")
                .HasConversion<int>()
                .IsRequired();

            builder.Property(i => i.Data)
                .HasColumnName("data")
                .HasColumnType("bytea")
                .IsRequired();

            builder.Property(i => i.ContentType)
                .HasColumnName("content_type")
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(i => i.FileName)
                .HasColumnName("file_name")
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(i => i.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(i => i.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.HasIndex(i => new { i.SiteId, i.ImageType }).IsUnique();

            builder.HasOne(i => i.Site)
                .WithMany()
                .HasForeignKey(i => i.SiteId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
