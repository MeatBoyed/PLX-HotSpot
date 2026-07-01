namespace AuraConnect.Application.DTOs.Metrics
{
    public class KpiSummaryResponse
    {
        public double TotalDataGb { get; init; }
        public int TotalSessions { get; init; }
        public int UniqueUsers { get; init; }
        public int NewUsers { get; init; }
        public int ReturningUsers { get; init; }
    }
}
