using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Infrastructure.Data.Configurations
{
    public class BrandingConfiguration : IEntityTypeConfiguration<Branding>
    {
        public void Configure(EntityTypeBuilder<Branding> builder)
        {
            builder.ToTable("branding");

            builder.HasKey(b => b.SiteId);

            builder.Property(b => b.SiteId)
                .HasColumnName("site_id")
                .HasMaxLength(32)
                .IsRequired();  // Make it required in DB

            // Colors
            builder.Property(b => b.BrandPrimary).HasColumnName("brand_primary").HasMaxLength(7);
            builder.Property(b => b.BrandPrimaryHover).HasColumnName("brand_primary_hover").HasMaxLength(7);
            builder.Property(b => b.BrandSecondary).HasColumnName("brand_secondary").HasMaxLength(7);
            builder.Property(b => b.BrandAccent).HasColumnName("brand_accent").HasMaxLength(7);
            builder.Property(b => b.TextPrimary).HasColumnName("text_primary").HasMaxLength(7);
            builder.Property(b => b.TextSecondary).HasColumnName("text_secondary").HasMaxLength(7);
            builder.Property(b => b.TextTertiary).HasColumnName("text_tertiary").HasMaxLength(7);
            builder.Property(b => b.TextMuted).HasColumnName("text_muted").HasMaxLength(7);
            builder.Property(b => b.SurfaceCard).HasColumnName("surface_card").HasMaxLength(7);
            builder.Property(b => b.SurfaceWhite).HasColumnName("surface_white").HasMaxLength(7);
            builder.Property(b => b.SurfaceBorder).HasColumnName("surface_border").HasMaxLength(7);
            builder.Property(b => b.ButtonPrimary).HasColumnName("button_primary").HasMaxLength(7);
            builder.Property(b => b.ButtonPrimaryHover).HasColumnName("button_primary_hover").HasMaxLength(7);
            builder.Property(b => b.ButtonPrimaryText).HasColumnName("button_primary_text").HasMaxLength(7);
            builder.Property(b => b.ButtonSecondary).HasColumnName("button_secondary").HasMaxLength(7);
            builder.Property(b => b.ButtonSecondaryHover).HasColumnName("button_secondary_hover").HasMaxLength(7);
            builder.Property(b => b.ButtonSecondaryText).HasColumnName("button_secondary_text").HasMaxLength(7);

            // Images
            builder.Property(b => b.LogoUrl).HasColumnName("logo_url").HasMaxLength(255);
            builder.Property(b => b.LogoWhiteUrl).HasColumnName("logo_white_url").HasMaxLength(255);
            builder.Property(b => b.ConnectCardBgUrl).HasColumnName("connect_card_bg_url").HasMaxLength(255);
            builder.Property(b => b.BannerOverlayUrl).HasColumnName("banner_overlay_url").HasMaxLength(255);
            builder.Property(b => b.FaviconUrl).HasColumnName("favicon_url").HasMaxLength(255);
            builder.Property(b => b.SplashBgUrl).HasColumnName("splash_bg_url").HasMaxLength(255);

            // Content
            builder.Property(b => b.Heading).HasColumnName("heading").HasMaxLength(255);
            builder.Property(b => b.Subheading).HasColumnName("subheading").HasMaxLength(255);
            builder.Property(b => b.ButtonText).HasColumnName("button_text").HasMaxLength(255);
            builder.Property(b => b.TermsLinks).HasColumnName("terms_links").HasColumnType("text");

            // Venue
            builder.Property(b => b.VenueLabel).HasColumnName("venue_label").HasMaxLength(255);
            builder.Property(b => b.VenueRoute).HasColumnName("venue_route").HasMaxLength(255);
            builder.Property(b => b.SortOrder).HasColumnName("sort_order").HasDefaultValue(0);

            // Timestamps
            builder.Property(b => b.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            builder.Property(b => b.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}
