using AuraConnect.Core.Entities;

namespace AuraConnect.Core.Interfaces.Repositories
{
    public interface IGatewaySessionEventRepository
    {
        Task<GatewaySessionEvent?> FindMostRecentByMacAsync(string mac, TimeSpan window, CancellationToken cancellationToken = default);

        Task<(List<GatewaySessionEvent> Items, int Total)> GetPagedAsync(
            int page, int pageSize, string? tenantId, string? siteId, string? mac, GatewayLoginOutcome? outcome,
            DateTime? from, DateTime? to, CancellationToken cancellationToken = default);

        Task AddAsync(GatewaySessionEvent gatewaySessionEvent, CancellationToken cancellationToken = default);
        Task UpdateAsync(GatewaySessionEvent gatewaySessionEvent, CancellationToken cancellationToken = default);
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
