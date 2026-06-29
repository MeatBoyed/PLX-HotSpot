namespace AuraConnect.Application.DTOs.Metrics
{
    public class UnattributedStationsResponse
    {
        public IReadOnlyList<UnattributedStationEntry> Entries { get; init; } = [];
    }
}
