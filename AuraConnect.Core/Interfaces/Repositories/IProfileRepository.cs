using AuraConnect.Core.Entities;

namespace AuraConnect.Core.Interfaces.Repositories
{
    public interface IProfileRepository
    {
        Task<Profile?> GetByIdentityUserIdAsync(string identityUserId, CancellationToken cancellationToken = default);
        Task<Profile?> GetByIdAsync(string profileId, CancellationToken cancellationToken = default);
        Task AddAsync(Profile profile, CancellationToken cancellationToken = default);
        Task UpdateAsync(Profile profile, CancellationToken cancellationToken = default);
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
