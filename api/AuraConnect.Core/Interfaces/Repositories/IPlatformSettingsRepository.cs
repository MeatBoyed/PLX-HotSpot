using AuraConnect.Core.Entities;

namespace AuraConnect.Core.Interfaces.Repositories
{
    public interface IPlatformSettingsRepository
    {
        Task<PlatformSettings?> GetAsync(CancellationToken cancellationToken = default);
        Task UpsertAsync(PlatformSettings settings, CancellationToken cancellationToken = default);
        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
