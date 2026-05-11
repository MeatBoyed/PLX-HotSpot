using AuraConnect.Core.Entities;

namespace AuraConnect.Core.Interfaces.Repositories
{
    public interface IWalletTransactionRepository
    {
        Task<WalletTransaction?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<WalletTransaction?> GetByReferenceAsync(string reference, CancellationToken cancellationToken = default);
        Task<IEnumerable<WalletTransaction>> GetByProfileIdAsync(string profileId, CancellationToken cancellationToken = default);
        Task<(List<WalletTransaction> Items, int Total)> GetPagedAsync(int page, int pageSize, string? profileId, string? tenantId, string? siteId, CancellationToken cancellationToken = default);
        Task AddAsync(WalletTransaction transaction, CancellationToken cancellationToken = default);
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
