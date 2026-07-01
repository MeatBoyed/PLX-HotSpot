using AuraConnect.Application.DTOs.Metrics;

namespace AuraConnect.Application.Interfaces
{
    public interface IUsageReportingService
    {
        Task<UsageTrendResponse> GetUsageTrendAsync(string? siteId, string? tenantId, DateTime from, DateTime to, string granularity, CancellationToken cancellationToken = default);
        Task<KpiSummaryResponse> GetKpiSummaryAsync(string? siteId, string? tenantId, DateTime from, DateTime to, CancellationToken cancellationToken = default);
        Task<SiteLeaderboardResponse> GetSiteLeaderboardAsync(DateTime from, DateTime to, string metric, CancellationToken cancellationToken = default);
        Task<ActiveSessionsResponse> GetActiveSessionsSummaryAsync(string? siteId, string? tenantId, CancellationToken cancellationToken = default);
        Task<LoginHealthResponse> GetLoginHealthAsync(string? siteId, DateTime from, DateTime to, CancellationToken cancellationToken = default);
        Task<MyUsageResponse> GetMyUsageAsync(string profileId, DateTime from, DateTime to, CancellationToken cancellationToken = default);
        Task<UnattributedStationsResponse> GetUnattributedStationsAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
    }
}
