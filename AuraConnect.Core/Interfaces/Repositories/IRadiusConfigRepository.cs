using AuraConnect.Core.Entities;

namespace AuraConnect.Core.Interfaces.Repositories
{
    public interface IRadiusConfigRepository
    {
        Task<RadiusConfig?> GetBySiteIdAsync(string siteId, CancellationToken cancellationToken = default);
        Task<RadiusConfig?> GetByGatewayHostAsync(string host, CancellationToken cancellationToken = default);
        Task AddAsync(RadiusConfig config, CancellationToken cancellationToken = default);
        Task UpdateAsync(RadiusConfig config, CancellationToken cancellationToken = default);
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
