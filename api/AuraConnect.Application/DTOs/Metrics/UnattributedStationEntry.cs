namespace AuraConnect.Application.DTOs.Metrics
{
    public class UnattributedStationEntry
    {
        public string CalledStationId { get; init; } = string.Empty;
        public int Sessions { get; init; }
        public DateTime FirstSeen { get; init; }
        public DateTime LastSeen { get; init; }
        public IReadOnlyList<string> SampleUsernames { get; init; } = [];
    }
}
