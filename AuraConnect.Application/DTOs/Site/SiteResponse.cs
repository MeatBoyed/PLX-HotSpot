using AuraConnect.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.DTOs.Site
{
    /// <summary>
    /// What the API returns for site data
    /// </summary>
    public class SiteResponse
    {
        public string Id { get; set; } = string.Empty;
        public string TenantId { get; set; } = string.Empty;
        public string TenantName { get; set; } = string.Empty;  // Included for convenience
        public string Ssid { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Domain { get; set; }
        public string? SuccessRedirectUrl { get; set; }
        public SiteStatus Status { get; set; }
        public int SortOrder { get; set; }
        public string[] AuthMethods { get; set; } = [];
        public bool MarketingOptIn { get; set; }
        public string[] RadiusCalledStationIds { get; set; } = [];
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Counts for convenience (useful for admin UI)
        public int PackageCount { get; set; }
        public bool HasBranding { get; set; }
        public bool HasRadiusConfig { get; set; }
    }
}
