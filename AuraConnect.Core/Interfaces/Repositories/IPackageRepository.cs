using AuraConnect.Core.Entities;

namespace AuraConnect.Core.Interfaces.Repositories
{
    public interface IPackageRepository
    {
        Task<Package?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IEnumerable<Package>> GetBySiteIdAsync(string siteId, CancellationToken cancellationToken = default);
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
