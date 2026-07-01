using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.DTOs.Branding
{
    /// <summary>
    /// Complete branding configuration returned to client
    /// </summary>
    public class BrandingResponse
    {
        // Colors
        public string BrandPrimary { get; set; } = "#301358";
        public string BrandPrimaryHover { get; set; } = "#5B3393";
        public string BrandSecondary { get; set; } = "#F2F2F2";
        public string BrandAccent { get; set; } = "#F60031";
        public string TextPrimary { get; set; } = "#181818";
        public string TextSecondary { get; set; } = "#5D5D5D";
        public string TextTertiary { get; set; } = "#7A7A7A";
        public string TextMuted { get; set; } = "#CECECE";
        public string SurfaceCard { get; set; } = "#F2F2F2";
        public string SurfaceWhite { get; set; } = "#FFFFFF";
        public string SurfaceBorder { get; set; } = "#CECECE";
        public string ButtonPrimary { get; set; } = "#301358";
        public string ButtonPrimaryHover { get; set; } = "#5B3393";
        public string ButtonPrimaryText { get; set; } = "#FFFFFF";
        public string ButtonSecondary { get; set; } = "#FFFFFF";
        public string ButtonSecondaryHover { get; set; } = "#f5f5f5";
        public string ButtonSecondaryText { get; set; } = "#301358";

        // Images
        public string LogoUrl { get; set; } = "/logo-default.svg";
        public string LogoWhiteUrl { get; set; } = "/logo-white-default.svg";
        public string ConnectCardBgUrl { get; set; } = "/connect-bg-default.png";
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
        public int SortOrder { get; set; }

        // Metadata
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
