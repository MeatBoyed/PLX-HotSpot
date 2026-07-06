namespace AuraConnect.Infrastructure.Services
{
    public interface IRadiusAccountingClient
    {
        Task<IReadOnlyList<RadiusDailySessionAggregate>> GetDailySessionAggregatesAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<RadiusCalledStationSummary>> GetCalledStationSummariesAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<string>> GetSampleUsernamesAsync(string calledStationId, int limit, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<RadiusDailyUsage>> GetDailyUsageByUsernamesAsync(IEnumerable<string> usernames, DateTime from, DateTime to, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<RadiusActiveSession>> GetActiveSessionsAsync(CancellationToken cancellationToken = default);
        Task<IReadOnlyList<string>> GetUsernamesByCalledStationIdsAsync(IEnumerable<string> calledStationIds, DateTime from, DateTime to, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<RadiusAuthReplyCount>> GetAuthReplyCountsAsync(IEnumerable<string>? usernames, DateTime from, DateTime to, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<RadiusUsernameFirstSeen>> GetUsernameFirstSeenAsync(IEnumerable<string>? calledStationIds, DateTime from, DateTime to, CancellationToken cancellationToken = default);
    }
}
