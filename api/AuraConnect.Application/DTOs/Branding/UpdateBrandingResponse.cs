using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.DTOs.Branding
{
    /// <summary>
    /// Full branding update (all fields optional - only provided fields will update)
    /// </summary>
    public class UpdateBrandingRequest
    {
        // Colors
        public string? BrandPrimary { get; set; }
        public string? BrandPrimaryHover { get; set; }
        public string? BrandSecondary { get; set; }
        public string? BrandAccent { get; set; }
        public string? TextPrimary { get; set; }
        public string? TextSecondary { get; set; }
        public string? TextTertiary { get; set; }
        public string? TextMuted { get; set; }
        public string? SurfaceCard { get; set; }
        public string? SurfaceWhite { get; set; }
        public string? SurfaceBorder { get; set; }
        public string? ButtonPrimary { get; set; }
        public string? ButtonPrimaryHover { get; set; }
        public string? ButtonPrimaryText { get; set; }
        public string? ButtonSecondary { get; set; }
        public string? ButtonSecondaryHover { get; set; }
        public string? ButtonSecondaryText { get; set; }

        // Images
        public string? LogoUrl { get; set; }
        public string? LogoWhiteUrl { get; set; }
        public string? ConnectCardBgUrl { get; set; }
        public string? BannerOverlayUrl { get; set; }
        public string? FaviconUrl { get; set; }
        public string? SplashBgUrl { get; set; }

        // Content
        public string? DisplayName { get; set; }
        public string? Heading { get; set; }
        public string? Subheading { get; set; }
        public string? SplashHeading { get; set; }
        public string? ButtonText { get; set; }
        public string? TermsLinks { get; set; }

        // Venue
        public string? VenueLabel { get; set; }
        public string? VenueRoute { get; set; }
        public int? SortOrder { get; set; }
    }
}
