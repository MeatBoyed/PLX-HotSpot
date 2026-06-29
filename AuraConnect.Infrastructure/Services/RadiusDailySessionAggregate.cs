namespace AuraConnect.Infrastructure.Services
{
    public class RadiusDailySessionAggregate
    {
        public string CalledStationId { get; init; } = string.Empty;
        public DateTime Date { get; init; }
        public long BytesIn { get; init; }
        public long BytesOut { get; init; }
        public int Sessions { get; init; }
        public int UniqueUsers { get; init; }
    }
}
