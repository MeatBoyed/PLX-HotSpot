namespace AuraConnect.Application.DTOs.Metrics
{
    public class UsageTrendPoint
    {
        public DateOnly Date { get; init; }
        public long BytesIn { get; init; }
        public long BytesOut { get; init; }
        public int Sessions { get; init; }
        public int UniqueUsers { get; init; }
    }
}
