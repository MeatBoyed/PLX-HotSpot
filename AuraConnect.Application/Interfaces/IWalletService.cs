using AuraConnect.Application.DTOs.Wallet;
using AuraConnect.Core.Entities;

namespace AuraConnect.Application.Interfaces
{
    public interface IWalletService
    {
        Task InitializeWalletAsync(Profile profile, CancellationToken cancellationToken = default);
        Task<WalletBalanceResponse> GetBalanceAsync(string profileId, CancellationToken cancellationToken = default);
        Task<IEnumerable<WalletTransactionResponse>> GetTransactionsAsync(string profileId, CancellationToken cancellationToken = default);
        Task<TopUpResponse> InitiateTopUpAsync(string profileId, decimal amount, string notifyUrl, string returnUrl, string cancelUrl, CancellationToken cancellationToken = default);
        Task ProcessTopUpIpnAsync(Dictionary<string, string> ipnData, string gatewaySource, CancellationToken cancellationToken = default);
        Task<UserPackageResponse> PurchasePackageAsync(string profileId, string packageId, CancellationToken cancellationToken = default);
        Task<IEnumerable<UserPackageResponse>> GetUserPackagesAsync(string profileId, CancellationToken cancellationToken = default);
    }
}
