using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Core.Entities
{
    public class Branding
    {
        public string? SiteId { get; private set; } 

        // Colors
        public string BrandPrimary { get; private set; } = "#301358";
        public string BrandPrimaryHover { get; private set; } = "#5B3393";
        public string BrandSecondary { get; private set; } = "#F2F2F2";
        public string BrandAccent { get; private set; } = "#F60031";
        public string TextPrimary { get; private set; } = "#181818";
        public string TextSecondary { get; private set; } = "#5D5D5D";
        public string TextTertiary { get; private set; } = "#7A7A7A";
        public string TextMuted { get; private set; } = "#CECECE";
        public string SurfaceCard { get; private set; } = "#F2F2F2";
        public string SurfaceWhite { get; private set; } = "#FFFFFF";
        public string SurfaceBorder { get; private set; } = "#CECECE";
        public string ButtonPrimary { get; private set; } = "#301358";
        public string ButtonPrimaryHover { get; private set; } = "#5B3393";
        public string ButtonPrimaryText { get; private set; } = "#FFFFFF";
        public string ButtonSecondary { get; private set; } = "#FFFFFF";
        public string ButtonSecondaryHover { get; private set; } = "#f5f5f5";
        public string ButtonSecondaryText { get; private set; } = "#301358";

        // Images (URLs)
        public string LogoUrl { get; private set; } = "/logo-default.svg";
        public string LogoWhiteUrl { get; private set; } = "/logo-white-default.svg";
        public string ConnectCardBgUrl { get; private set; } = "/connect-bg-default.png";
        public string? BannerOverlayUrl { get; private set; }
        public string? FaviconUrl { get; private set; }
        public string? SplashBgUrl { get; private set; }

        // Content
        public string? Heading { get; private set; }
        public string? Subheading { get; private set; }
        public string? ButtonText { get; private set; }
        public string? TermsLinks { get; private set; }

        // Venue
        public string? VenueLabel { get; private set; }
        public string? VenueRoute { get; private set; }
        public int SortOrder { get; private set; }

        // Timestamps
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        // Navigation
        public virtual Site Site { get; private set; } = null!;

        // EF Core constructor
        private Branding() { }

        // Domain constructor
        public Branding(string siteId)
        {
            SiteId = siteId;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        // Color setters with validation
        public void SetBrandPrimary(string color)
        {
            if (!IsValidHexColor(color))
                throw new ArgumentException("Invalid hex color format");
            BrandPrimary = color;
            UpdateTimestamp();
        }

        public void SetBrandPrimaryHover(string color)
        {
            if (!IsValidHexColor(color))
                throw new ArgumentException("Invalid hex color format");
            BrandPrimaryHover = color;
            UpdateTimestamp();
        }

        public void SetBrandSecondary(string color)
        {
            if (!IsValidHexColor(color))
                throw new ArgumentException("Invalid hex color format");
            BrandSecondary = color;
            UpdateTimestamp();
        }

        public void SetBrandAccent(string color)
        {
            if (!IsValidHexColor(color))
                throw new ArgumentException("Invalid hex color format");
            BrandAccent = color;
            UpdateTimestamp();
        }

        // Bulk color update
        public void UpdateColors(BrandingColors colors)
        {
            SetBrandPrimary(colors.BrandPrimary);
            SetBrandPrimaryHover(colors.BrandPrimaryHover);
            SetBrandSecondary(colors.BrandSecondary);
            SetBrandAccent(colors.BrandAccent);
            // ... update all colors as needed
        }

        // Image setters
        public void SetLogoUrl(string url)
        {
            LogoUrl = url;
            UpdateTimestamp();
        }

        public void SetLogoWhiteUrl(string url)
        {
            LogoWhiteUrl = url;
            UpdateTimestamp();
        }

        public void SetConnectCardBgUrl(string url)
        {
            ConnectCardBgUrl = url;
            UpdateTimestamp();
        }

        public void SetBannerOverlayUrl(string? url)
        {
            BannerOverlayUrl = url;
            UpdateTimestamp();
        }

        public void SetFaviconUrl(string? url)
        {
            FaviconUrl = url;
            UpdateTimestamp();
        }

        public void SetSplashBgUrl(string? url)
        {
            SplashBgUrl = url;
            UpdateTimestamp();
        }

        // Content setters
        public void SetHeading(string? heading)
        {
            Heading = heading;
            UpdateTimestamp();
        }

        public void SetSubheading(string? subheading)
        {
            Subheading = subheading;
            UpdateTimestamp();
        }

        public void SetButtonText(string? buttonText)
        {
            ButtonText = buttonText;
            UpdateTimestamp();
        }

        public void SetTermsLinks(string? termsLinks)
        {
            TermsLinks = termsLinks;
            UpdateTimestamp();
        }

        // Venue setters
        public void SetVenueLabel(string? label)
        {
            VenueLabel = label;
            UpdateTimestamp();
        }

        public void SetVenueRoute(string? route)
        {
            VenueRoute = route;
            UpdateTimestamp();
        }

        public void SetSortOrder(int order)
        {
            SortOrder = order;
            UpdateTimestamp();
        }

        // Helper methods
        private static bool IsValidHexColor(string color)
        {
            return System.Text.RegularExpressions.Regex.IsMatch(color, "^#[0-9A-Fa-f]{6}$");
        }

        private void UpdateTimestamp() => UpdatedAt = DateTime.UtcNow;

        // Add these setter methods to your existing Branding class
        public void SetTextPrimary(string color) { TextPrimary = color; UpdateTimestamp(); }
        public void SetTextSecondary(string color) { TextSecondary = color; UpdateTimestamp(); }
        public void SetTextTertiary(string color) { TextTertiary = color; UpdateTimestamp(); }
        public void SetTextMuted(string color) { TextMuted = color; UpdateTimestamp(); }
        public void SetSurfaceCard(string color) { SurfaceCard = color; UpdateTimestamp(); }
        public void SetSurfaceWhite(string color) { SurfaceWhite = color; UpdateTimestamp(); }
        public void SetSurfaceBorder(string color) { SurfaceBorder = color; UpdateTimestamp(); }
        public void SetButtonPrimary(string color) { ButtonPrimary = color; UpdateTimestamp(); }
        public void SetButtonPrimaryHover(string color) { ButtonPrimaryHover = color; UpdateTimestamp(); }
        public void SetButtonPrimaryText(string color) { ButtonPrimaryText = color; UpdateTimestamp(); }
        public void SetButtonSecondary(string color) { ButtonSecondary = color; UpdateTimestamp(); }
        public void SetButtonSecondaryHover(string color) { ButtonSecondaryHover = color; UpdateTimestamp(); }
        public void SetButtonSecondaryText(string color) { ButtonSecondaryText = color; UpdateTimestamp(); }
    }

    // DTO for bulk color updates (can be placed in Application layer later)
    public class BrandingColors
    {
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
    }
}
