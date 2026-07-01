namespace AuraConnect.Application.DTOs.Metrics
{
    public class ActiveSessionsBySite
    {
        public string SiteId { get; init; } = string.Empty;
        public string SiteName { get; init; } = string.Empty;
        public int ActiveCount { get; init; }
    }
}
