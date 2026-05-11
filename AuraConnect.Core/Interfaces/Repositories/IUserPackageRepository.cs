using AuraConnect.Core.Entities;

namespace AuraConnect.Core.Interfaces.Repositories
{
    public interface IUserPackageRepository
    {
        Task<UserPackage?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IEnumerable<UserPackage>> GetByProfileIdAsync(string profileId, CancellationToken cancellationToken = default);
        Task<UserPackage?> GetActiveByProfileAndSiteAsync(string profileId, string siteId, CancellationToken cancellationToken = default);
        Task AddAsync(UserPackage userPackage, CancellationToken cancellationToken = default);
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
