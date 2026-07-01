namespace AuraConnect.Application.DTOs.Metrics
{
    public class ActiveSessionsResponse
    {
        public DateTime CheckedAt { get; init; }
        public int TotalActive { get; init; }
        public IReadOnlyList<ActiveSessionsBySite> BySite { get; init; } = [];
    }
}
