namespace AuraConnect.Application.DTOs.Metrics
{
    public class MyUsageResponse
    {
        public IReadOnlyList<MyUsagePoint> Points { get; init; } = [];
        public long? PackageDataCapBytes { get; init; }
        public long? PackageDataUsedBytes { get; init; }
    }
}
