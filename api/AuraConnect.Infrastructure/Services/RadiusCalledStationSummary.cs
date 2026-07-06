namespace AuraConnect.Infrastructure.Services
{
    public class RadiusCalledStationSummary
    {
        public string CalledStationId { get; init; } = string.Empty;
        public int Sessions { get; init; }
        public DateTime FirstSeen { get; init; }
        public DateTime LastSeen { get; init; }
    }
}
