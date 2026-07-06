namespace AuraConnect.Application.DTOs.Metrics
{
    public class SiteLeaderboardResponse
    {
        public string Metric { get; init; } = string.Empty;
        public IReadOnlyList<SiteLeaderboardEntry> Entries { get; init; } = [];
    }
}
