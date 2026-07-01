using System;

namespace AuraConnect.Core.Entities
{
    public class RadiusConfig
    {
        public string? SiteId { get; private set; }

        // MikroTik gateway
        public string? GatewayUrl { get; private set; }
        public string? FreeUsername { get; private set; }
        public string? FreePassword { get; private set; }

        // RadiusDesk integration
        public string? RadiusDeskUrl { get; private set; }
        public string? RadiusDeskApiToken { get; private set; }
        public string? RadiusDeskRealmId { get; private set; }
        public string? RadiusDeskCloudId { get; private set; }

        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        // Navigation
        public virtual Site Site { get; private set; } = null!;

        // EF Core constructor
        private RadiusConfig() { }

        // Domain constructor
        public RadiusConfig(string siteId)
        {
            SiteId = siteId;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetGatewayUrl(string? url)
        {
            if (url != null && !Uri.IsWellFormedUriString(url, UriKind.Absolute))
                throw new ArgumentException("Invalid gateway URL format");
            GatewayUrl = url;
            UpdateTimestamp();
        }

        public void SetFreeUsername(string? username)
        {
            FreeUsername = username;
            UpdateTimestamp();
        }

        public void SetFreePassword(string? password)
        {
            FreePassword = password;
            UpdateTimestamp();
        }

        public void SetRadiusDeskUrl(string? url)
        {
            if (url != null && !Uri.IsWellFormedUriString(url, UriKind.Absolute))
                throw new ArgumentException("Invalid RadiusDesk URL format");
            RadiusDeskUrl = url;
            UpdateTimestamp();
        }

        public void SetRadiusDeskApiToken(string? token)
        {
            RadiusDeskApiToken = token;
            UpdateTimestamp();
        }

        public void SetRadiusDeskRealmId(string? realmId)
        {
            RadiusDeskRealmId = realmId;
            UpdateTimestamp();
        }

        public void SetRadiusDeskCloudId(string? cloudId)
        {
            RadiusDeskCloudId = cloudId;
            UpdateTimestamp();
        }

        private void UpdateTimestamp() => UpdatedAt = DateTime.UtcNow;
    }
}
