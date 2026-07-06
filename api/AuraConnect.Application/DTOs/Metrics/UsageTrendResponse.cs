namespace AuraConnect.Application.DTOs.Metrics
{
    public class UsageTrendResponse
    {
        public string Granularity { get; init; } = "day";
        public IReadOnlyList<UsageTrendPoint> Points { get; init; } = [];
        public long UnattributedBytes { get; init; }
    }
}
