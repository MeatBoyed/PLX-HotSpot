using AuraConnect.Core.Entities;

namespace AuraConnect.Core.Interfaces.Repositories
{
    public interface IProfileRepository
    {
        Task<Profile?> GetByIdentityUserIdAsync(string identityUserId, CancellationToken cancellationToken = default);
        Task<Profile?> GetByIdAsync(string profileId, CancellationToken cancellationToken = default);
        Task<Profile?> GetByIdWithSitesAsync(string profileId, CancellationToken cancellationToken = default);
        Task<(List<Profile> Items, int Total)> GetPagedAsync(int page, int pageSize, string? tenantId, string? siteId, CancellationToken cancellationToken = default);
        Task AddAsync(Profile profile, CancellationToken cancellationToken = default);
        Task UpdateAsync(Profile profile, CancellationToken cancellationToken = default);
        Task CreditBalanceAsync(string profileId, decimal amount, CancellationToken cancellationToken = default);
        Task<bool> DebitBalanceAsync(string profileId, decimal amount, CancellationToken cancellationToken = default);
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
