using AuraConnect.Application.DTOs.Wallet;

namespace AuraConnect.Application.Interfaces
{
    public interface IBlnkService
    {
        Task<string> CreateIdentityAsync(string firstName, string lastName, string email, CancellationToken cancellationToken = default);
        Task<string> CreateBalanceAsync(string ledgerId, string identityId, string currency, CancellationToken cancellationToken = default);
        Task<BlnkBalanceResponse> GetBalanceAsync(string balanceId, CancellationToken cancellationToken = default);
        Task<string> RecordTransactionAsync(string source, string destination, decimal amount, string reference, string currency, string description, CancellationToken cancellationToken = default);
        Task<IEnumerable<BlnkTransactionResponse>> GetTransactionsByBalanceAsync(string balanceId, CancellationToken cancellationToken = default);
        Task<string> EnsurePlatformLedgerAsync(CancellationToken cancellationToken = default);
        Task<string> EnsurePlatformBalanceAsync(string ledgerId, CancellationToken cancellationToken = default);
    }
}
