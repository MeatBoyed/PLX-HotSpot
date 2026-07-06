using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.DTOs.Branding
{
    /// <summary>
    /// Update only image URL fields
    /// </summary>
    public class UpdateImagesRequest
    {
        public string? LogoUrl { get; set; }
        public string? LogoWhiteUrl { get; set; }
        public string? ConnectCardBgUrl { get; set; }
        public string? BannerOverlayUrl { get; set; }
        public string? FaviconUrl { get; set; }
        public string? SplashBgUrl { get; set; }
    }
}
