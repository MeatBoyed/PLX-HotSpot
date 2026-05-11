using AuraConnect.Application.DTOs.Admin;
using AuraConnect.Application.DTOs.Wallet;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AuraConnect.Infrastructure.Services
{
    public class WalletService : IWalletService
    {
        private readonly IBlnkService _blnk;
        private readonly IPayFastService _payFast;
        private readonly IProfileRepository _profileRepository;
        private readonly IWalletTransactionRepository _walletTransactionRepository;
        private readonly IUserPackageRepository _userPackageRepository;
        private readonly IPackageRepository _packageRepository;
        private readonly string _platformLedgerId;
        private readonly string _platformBalanceId;
        private readonly ILogger<WalletService> _logger;

        public WalletService(
            IBlnkService blnk,
            IPayFastService payFast,
            IProfileRepository profileRepository,
            IWalletTransactionRepository walletTransactionRepository,
            IUserPackageRepository userPackageRepository,
            IPackageRepository packageRepository,
            IConfiguration configuration,
            ILogger<WalletService> logger)
        {
            _blnk = blnk;
            _payFast = payFast;
            _profileRepository = profileRepository;
            _walletTransactionRepository = walletTransactionRepository;
            _userPackageRepository = userPackageRepository;
            _packageRepository = packageRepository;
            _platformLedgerId = configuration["Blnk:PlatformLedgerId"] ?? throw new InvalidOperationException("Blnk:PlatformLedgerId is not configured");
            _platformBalanceId = configuration["Blnk:PlatformBalanceId"] ?? throw new InvalidOperationException("Blnk:PlatformBalanceId is not configured");
            _logger = logger;
        }

        public async Task InitializeWalletAsync(Profile profile, CancellationToken cancellationToken = default)
        {
            var identityId = await _blnk.CreateIdentityAsync(profile.FirstName, profile.LastName, string.Empty, cancellationToken);
            var balanceId = await _blnk.CreateBalanceAsync(_platformLedgerId, identityId, "ZAR", cancellationToken);

            profile.SetBlnkIdentityId(identityId);
            profile.SetBlnkWalletId(balanceId);

            await _profileRepository.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Wallet initialized for profile {ProfileId} — identity {IdentityId} balance {BalanceId}", profile.Id, identityId, balanceId);
        }

        public async Task<WalletBalanceResponse> GetBalanceAsync(string profileId, CancellationToken cancellationToken = default)
        {
            var profile = await _profileRepository.GetByIdAsync(profileId, cancellationToken)
                ?? throw new InvalidOperationException("Profile not found");

            if (string.IsNullOrEmpty(profile.BlnkWalletId))
                throw new InvalidOperationException("Wallet not initialized for this profile");

            var blnkBalance = await _blnk.GetBalanceAsync(profile.BlnkWalletId, cancellationToken);

            return new WalletBalanceResponse
            {
                ProfileId = profileId,
                Balance = blnkBalance.Balance / 100m,
                AvailableBalance = blnkBalance.AvailableBalance / 100m,
                Currency = blnkBalance.Currency
            };
        }

        public async Task<IEnumerable<WalletTransactionResponse>> GetTransactionsAsync(string profileId, CancellationToken cancellationToken = default)
        {
            var transactions = await _walletTransactionRepository.GetByProfileIdAsync(profileId, cancellationToken);
            return transactions.Select(MapTransaction);
        }

        public async Task<PagedResult<WalletTransactionResponse>> GetTransactionsPagedAsync(int page, int pageSize, string? profileId, string? tenantId, string? siteId, CancellationToken cancellationToken = default)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var (items, total) = await _walletTransactionRepository.GetPagedAsync(page, pageSize, profileId, tenantId, siteId, cancellationToken);

            return new PagedResult<WalletTransactionResponse>
            {
                Items = items.Select(MapTransaction).ToList(),
                Page = page,
                PageSize = pageSize,
                TotalCount = total
            };
        }

        private static WalletTransactionResponse MapTransaction(WalletTransaction t) => new()
        {
            Id = t.Id,
            BlnkTransactionId = t.BlnkTransactionId,
            Type = t.Type.ToString(),
            Amount = t.Amount,
            Currency = t.Currency,
            Reference = t.Reference,
            Status = t.Status,
            CreatedAt = t.CreatedAt
        };

        public async Task<TopUpResponse> InitiateTopUpAsync(string profileId, decimal amount, string notifyUrl, string returnUrl, string cancelUrl, CancellationToken cancellationToken = default)
        {
            if (amount <= 0)
                throw new ArgumentException("Top-up amount must be greater than zero");

            var profile = await _profileRepository.GetByIdAsync(profileId, cancellationToken)
                ?? throw new InvalidOperationException("Profile not found");

            var reference = Guid.NewGuid().ToString("N");

            var walletTx = new WalletTransaction(profileId, WalletTransactionType.TopUp, amount, "ZAR", reference);
            await _walletTransactionRepository.AddAsync(walletTx, cancellationToken);
            await _walletTransactionRepository.SaveChangesAsync(cancellationToken);

            var payFastUrl = await _payFast.CreatePaymentUrlAsync(amount, "AuraConnect Wallet Top-Up", reference, notifyUrl, returnUrl, cancelUrl);

            return new TopUpResponse { Reference = reference, Amount = amount, PayFastUrl = payFastUrl };
        }

        public async Task ProcessTopUpIpnAsync(Dictionary<string, string> ipnData, string gatewaySource, CancellationToken cancellationToken = default)
        {
            if (!_payFast.VerifyIpn(ipnData))
                throw new UnauthorizedAccessException("Invalid IPN signature");

            if (!ipnData.TryGetValue("m_payment_id", out var reference) || string.IsNullOrEmpty(reference))
                throw new InvalidOperationException("IPN missing m_payment_id");

            if (!ipnData.TryGetValue("payment_status", out var status) || status != "COMPLETE")
            {
                _logger.LogInformation("IPN received for ref {Reference} with non-complete status {Status} — ignoring", reference, status);
                return;
            }

            var walletTx = await _walletTransactionRepository.GetByReferenceAsync(reference, cancellationToken)
                ?? throw new InvalidOperationException($"No pending top-up found for reference {reference}");

            if (walletTx.Status == "Completed")
            {
                _logger.LogWarning("Duplicate IPN received for reference {Reference} — skipping", reference);
                return;
            }

            var profile = await _profileRepository.GetByIdAsync(walletTx.ProfileId, cancellationToken)
                ?? throw new InvalidOperationException("Profile not found");

            var blnkTxId = await _blnk.RecordTransactionAsync(
                source: gatewaySource,
                destination: profile.BlnkWalletId!,
                amount: walletTx.Amount,
                reference: reference,
                currency: "ZAR",
                description: $"Wallet top-up via {gatewaySource}",
                cancellationToken: cancellationToken);

            walletTx.Complete(blnkTxId);
            await _walletTransactionRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Top-up completed for profile {ProfileId} amount {Amount} ZAR via {Gateway}", profile.Id, walletTx.Amount, gatewaySource);
        }

        public async Task<UserPackageResponse> PurchasePackageAsync(string profileId, string packageId, CancellationToken cancellationToken = default)
        {
            var profile = await _profileRepository.GetByIdAsync(profileId, cancellationToken)
                ?? throw new InvalidOperationException("Profile not found");

            if (string.IsNullOrEmpty(profile.BlnkWalletId))
                throw new InvalidOperationException("Wallet not initialized for this profile");

            var package = await _packageRepository.GetByIdAsync(packageId, cancellationToken)
                ?? throw new InvalidOperationException("Package not found");

            if (!package.IsActive)
                throw new InvalidOperationException("Package is not available");

            var balance = await _blnk.GetBalanceAsync(profile.BlnkWalletId, cancellationToken);
            var availableZar = balance.AvailableBalance / 100m;

            if (availableZar < package.Price)
                throw new InvalidOperationException($"Insufficient funds. Available: R{availableZar:F2}, Required: R{package.Price:F2}");

            var reference = Guid.NewGuid().ToString("N");

            var blnkTxId = await _blnk.RecordTransactionAsync(
                source: profile.BlnkWalletId,
                destination: _platformBalanceId,
                amount: package.Price,
                reference: reference,
                currency: "ZAR",
                description: $"Package purchase: {package.Name}",
                cancellationToken: cancellationToken);

            var walletTx = new WalletTransaction(profileId, WalletTransactionType.PackagePurchase, package.Price, "ZAR", reference);
            walletTx.Complete(blnkTxId);
            await _walletTransactionRepository.AddAsync(walletTx, cancellationToken);

            var userPackage = new UserPackage(profileId, packageId, package.SiteId!, blnkTxId);
            await _userPackageRepository.AddAsync(userPackage, cancellationToken);

            await _walletTransactionRepository.SaveChangesAsync(cancellationToken);
            await _userPackageRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Package {PackageId} purchased by profile {ProfileId} for R{Price}", packageId, profileId, package.Price);

            return new UserPackageResponse
            {
                Id = userPackage.Id,
                PackageId = packageId,
                PackageName = package.Name,
                SiteId = package.SiteId ?? string.Empty,
                AmountPaid = package.Price,
                Currency = "ZAR",
                Status = userPackage.Status.ToString(),
                PurchasedAt = userPackage.PurchasedAt,
                ExpiresAt = userPackage.ExpiresAt
            };
        }

        public async Task<IEnumerable<UserPackageResponse>> GetUserPackagesAsync(string profileId, CancellationToken cancellationToken = default)
        {
            var packages = await _userPackageRepository.GetByProfileIdAsync(profileId, cancellationToken);
            return packages.Select(p => new UserPackageResponse
            {
                Id = p.Id,
                PackageId = p.PackageId,
                PackageName = p.Package?.Name ?? string.Empty,
                SiteId = p.SiteId,
                AmountPaid = p.Package?.Price ?? 0,
                Currency = "ZAR",
                Status = p.Status.ToString(),
                PurchasedAt = p.PurchasedAt,
                ExpiresAt = p.ExpiresAt
            });
        }
    }
}
