namespace AuraConnect.Application.DTOs.Radius
{
    public class RadiusConfigResponse
    {
        public string SiteId { get; set; } = string.Empty;

        public string? GatewayUrl { get; set; }
        public string? FreeUsername { get; set; }
        public string? FreePassword { get; set; }

        public string? RadiusDeskUrl { get; set; }
        public string? RadiusDeskApiToken { get; set; }
        public string? RadiusDeskRealmId { get; set; }
        public string? RadiusDeskCloudId { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
