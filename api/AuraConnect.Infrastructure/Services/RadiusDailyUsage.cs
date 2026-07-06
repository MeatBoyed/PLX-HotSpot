namespace AuraConnect.Infrastructure.Services
{
    public class RadiusDailyUsage
    {
        public DateTime Date { get; init; }
        public long BytesIn { get; init; }
        public long BytesOut { get; init; }
    }
}
