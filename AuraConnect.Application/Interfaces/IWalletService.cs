using AuraConnect.Application.DTOs.Admin;
using AuraConnect.Application.DTOs.Wallet;

namespace AuraConnect.Application.Interfaces
{
    public interface IWalletService
    {
        Task<WalletBalanceResponse> GetBalanceAsync(string profileId, CancellationToken cancellationToken = default);
        Task<IEnumerable<WalletTransactionResponse>> GetTransactionsAsync(string profileId, CancellationToken cancellationToken = default);
        Task<PagedResult<WalletTransactionResponse>> GetTransactionsPagedAsync(int page, int pageSize, string? profileId, string? tenantId, string? siteId, CancellationToken cancellationToken = default);
        Task<WalletTransactionResponse?> GetTransactionByIdAsync(string transactionId, string? profileId, CancellationToken cancellationToken = default);
        Task<TopUpResponse> InitiateTopUpAsync(string profileId, decimal amount, string? siteId, string? notifyUrl, string? returnUrl, string? cancelUrl, CancellationToken cancellationToken = default);
        Task ProcessTopUpIpnAsync(Dictionary<string, string> ipnData, CancellationToken cancellationToken = default);
        Task<UserPackageResponse> PurchasePackageAsync(string profileId, string packageId, CancellationToken cancellationToken = default);
        Task<IEnumerable<UserPackageResponse>> GetUserPackagesAsync(string profileId, CancellationToken cancellationToken = default);
        Task<PackageCredentialsResponse?> GetPackageCredentialsAsync(string userPackageId, string? profileId, CancellationToken cancellationToken = default);
        Task SetUserPackageActiveAsync(string userPackageId, bool active, CancellationToken cancellationToken = default);
    }
}
