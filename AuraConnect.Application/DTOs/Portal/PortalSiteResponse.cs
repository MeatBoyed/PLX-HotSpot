namespace AuraConnect.Application.DTOs.Portal
{
    public class PortalSiteResponse
    {
        public string Ssid { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public string LogoUrl { get; set; } = "/logo-default.svg";
        public int SortOrder { get; set; }
    }
}
