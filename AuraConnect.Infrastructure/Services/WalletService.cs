using AuraConnect.Application.DTOs.Admin;
using AuraConnect.Application.DTOs.Wallet;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace AuraConnect.Infrastructure.Services
{
    public class WalletService : IWalletService
    {
        private readonly IPayFastService _payFast;
        private readonly IProfileRepository _profileRepository;
        private readonly IWalletTransactionRepository _walletTransactionRepository;
        private readonly IUserPackageRepository _userPackageRepository;
        private readonly IPackageRepository _packageRepository;
        private readonly ISiteRepository _siteRepository;
        private readonly ILogger<WalletService> _logger;

        public WalletService(
            IPayFastService payFast,
            IProfileRepository profileRepository,
            IWalletTransactionRepository walletTransactionRepository,
            IUserPackageRepository userPackageRepository,
            IPackageRepository packageRepository,
            ISiteRepository siteRepository,
            ILogger<WalletService> logger)
        {
            _payFast = payFast;
            _profileRepository = profileRepository;
            _walletTransactionRepository = walletTransactionRepository;
            _userPackageRepository = userPackageRepository;
            _packageRepository = packageRepository;
            _siteRepository = siteRepository;
            _logger = logger;
        }

        public async Task<WalletBalanceResponse> GetBalanceAsync(string profileId, CancellationToken cancellationToken = default)
        {
            var profile = await _profileRepository.GetByIdAsync(profileId, cancellationToken)
                ?? throw new InvalidOperationException("Profile not found");

            return new WalletBalanceResponse
            {
                ProfileId = profileId,
                Balance = profile.Balance,
                AvailableBalance = profile.Balance,
                Currency = "ZAR"
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

        public async Task<TopUpResponse> InitiateTopUpAsync(string profileId, decimal amount, string? siteId, string? notifyUrl, string? returnUrl, string? cancelUrl, CancellationToken cancellationToken = default)
        {
            if (amount <= 0)
                throw new ArgumentException("Top-up amount must be greater than zero");

            _ = await _profileRepository.GetByIdAsync(profileId, cancellationToken)
                ?? throw new InvalidOperationException("Profile not found");

            var reference = Guid.NewGuid().ToString("N");
            var itemName = await BuildItemNameAsync(amount, siteId, cancellationToken);

            var walletTx = new WalletTransaction(profileId, WalletTransactionType.TopUp, amount, "ZAR", reference);
            await _walletTransactionRepository.AddAsync(walletTx, cancellationToken);
            await _walletTransactionRepository.SaveChangesAsync(cancellationToken);

            var (action, fields) = await _payFast.CreatePaymentFormAsync(amount, itemName, reference, notifyUrl, returnUrl, cancelUrl);

            return new TopUpResponse { Reference = reference, Amount = amount, PayFastAction = action, PayFastFields = fields };
        }

        private async Task<string> BuildItemNameAsync(decimal amount, string? siteId, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrEmpty(siteId))
            {
                var site = await _siteRepository.GetSiteWithDetailsAsync(siteId, cancellationToken);
                if (site != null)
                {
                    var parts = string.IsNullOrEmpty(site.Tenant?.Name)
                        ? $"{site.Name} - AuraConnect - Wallet Top-Up R{amount:F2}"
                        : $"{site.Name} - {site.Tenant.Name} - AuraConnect - Wallet Top-Up R{amount:F2}";
                    return parts.Length > 100 ? parts[..100] : parts;
                }
            }
            return $"AuraConnect - Wallet Top-Up R{amount:F2}";
        }

        public async Task ProcessTopUpIpnAsync(Dictionary<string, string> ipnData, CancellationToken cancellationToken = default)
        {
            if (!await _payFast.VerifyIpnAsync(ipnData, cancellationToken))
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

            await _profileRepository.CreditBalanceAsync(walletTx.ProfileId, walletTx.Amount, cancellationToken);

            walletTx.Complete();
            await _walletTransactionRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Top-up completed for profile {ProfileId} — R{Amount} credited", walletTx.ProfileId, walletTx.Amount);
        }

        public async Task<UserPackageResponse> PurchasePackageAsync(string profileId, string packageId, CancellationToken cancellationToken = default)
        {
            var package = await _packageRepository.GetByIdAsync(packageId, cancellationToken)
                ?? throw new InvalidOperationException("Package not found");

            if (!package.IsActive)
                throw new InvalidOperationException("Package is not available");

            var reference = Guid.NewGuid().ToString("N");

            var debited = await _profileRepository.DebitBalanceAsync(profileId, package.Price, cancellationToken);
            if (!debited)
                throw new InvalidOperationException($"Insufficient funds. Required: R{package.Price:F2}");

            var walletTx = new WalletTransaction(profileId, WalletTransactionType.PackagePurchase, package.Price, "ZAR", reference);
            walletTx.Complete();
            await _walletTransactionRepository.AddAsync(walletTx, cancellationToken);

            var userPackage = new UserPackage(profileId, packageId, package.SiteId!, reference);
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

        private static WalletTransactionResponse MapTransaction(WalletTransaction t) => new()
        {
            Id = t.Id,
            Type = t.Type.ToString(),
            Amount = t.Amount,
            Currency = t.Currency,
            Reference = t.Reference,
            Status = t.Status,
            CreatedAt = t.CreatedAt
        };
    }
}
