using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.DTOs.Branding
{
    /// <summary>
    /// Update only color-related fields
    /// </summary>
    public class UpdateColorsRequest
    {
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
    }
}
