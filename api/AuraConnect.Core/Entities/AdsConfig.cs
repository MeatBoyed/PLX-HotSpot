using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Core.Entities
{
    public class AdsConfig
    {
        public string? SiteId { get; private set; }
        public string? ReviveServerUrl { get; private set; }
        public string? ReviveZoneId { get; private set; }
        public string? ReviveId { get; private set; }
        public string? VastUrl { get; private set; }
        public bool IsEnabled { get; private set; } = true;
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        // Navigation
        public virtual Site Site { get; private set; } = null!;

        // EF Core constructor
        private AdsConfig() { }

        // Domain constructor
        public AdsConfig(string siteId)
        {
            SiteId = siteId;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        // Setters
        public void SetReviveServerUrl(string? url)
        {
            if (url != null && !Uri.IsWellFormedUriString(url, UriKind.Absolute))
                throw new ArgumentException("Invalid URL format");
            ReviveServerUrl = url;
            UpdateTimestamp();
        }

        public void SetReviveZoneId(string? zoneId)
        {
            ReviveZoneId = zoneId;
            UpdateTimestamp();
        }

        public void SetReviveId(string? reviveId)
        {
            ReviveId = reviveId;
            UpdateTimestamp();
        }

        public void SetVastUrl(string? url)
        {
            if (url != null && !Uri.IsWellFormedUriString(url, UriKind.Absolute))
                throw new ArgumentException("Invalid URL format");
            VastUrl = url;
            UpdateTimestamp();
        }

        public void Enable()
        {
            IsEnabled = true;
            UpdateTimestamp();
        }

        public void Disable()
        {
            IsEnabled = false;
            UpdateTimestamp();
        }

        private void UpdateTimestamp() => UpdatedAt = DateTime.UtcNow;
    }
}
