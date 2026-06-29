namespace AuraConnect.Application.DTOs.Metrics
{
    public class MyUsagePoint
    {
        public DateOnly Date { get; init; }
        public long BytesIn { get; init; }
        public long BytesOut { get; init; }
    }
}
