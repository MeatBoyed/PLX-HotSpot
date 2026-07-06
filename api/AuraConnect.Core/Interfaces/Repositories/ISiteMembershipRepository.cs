using AuraConnect.Core.Entities;

namespace AuraConnect.Core.Interfaces.Repositories
{
    public interface ISiteMembershipRepository
    {
        Task UpsertAsync(string profileId, string siteId, string tenantId, CancellationToken cancellationToken = default);
        Task<IEnumerable<string>> GetSiteIdsByProfileAsync(string profileId, CancellationToken cancellationToken = default);
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
