namespace AuraConnect.Application.DTOs.Metrics
{
    public class SiteLeaderboardEntry
    {
        public string SiteId { get; init; } = string.Empty;
        public string SiteName { get; init; } = string.Empty;
        public double Value { get; init; }
        public int Rank { get; init; }
    }
}
