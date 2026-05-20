using AuraConnect.Application.DTOs.Admin;
using AuraConnect.Application.DTOs.Wallet;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
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
        private readonly IRadiusConfigRepository _radiusConfigRepository;
        private readonly IRadiusProvisioningService _radiusProvisioning;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<WalletService> _logger;

        public WalletService(
            IPayFastService payFast,
            IProfileRepository profileRepository,
            IWalletTransactionRepository walletTransactionRepository,
            IUserPackageRepository userPackageRepository,
            IPackageRepository packageRepository,
            ISiteRepository siteRepository,
            IRadiusConfigRepository radiusConfigRepository,
            IRadiusProvisioningService radiusProvisioning,
            UserManager<ApplicationUser> userManager,
            ILogger<WalletService> logger)
        {
            _payFast = payFast;
            _profileRepository = profileRepository;
            _walletTransactionRepository = walletTransactionRepository;
            _userPackageRepository = userPackageRepository;
            _packageRepository = packageRepository;
            _siteRepository = siteRepository;
            _radiusConfigRepository = radiusConfigRepository;
            _radiusProvisioning = radiusProvisioning;
            _userManager = userManager;
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

        public async Task<WalletTransactionResponse?> GetTransactionByIdAsync(string transactionId, string? profileId, CancellationToken cancellationToken = default)
        {
            var tx = await _walletTransactionRepository.GetByIdAsync(transactionId, cancellationToken);
            if (tx == null) return null;
            if (profileId != null && tx.ProfileId != profileId) return null;
            return MapTransaction(tx);
        }

        public async Task<TopUpResponse> InitiateTopUpAsync(string profileId, decimal amount, string? siteId, string? notifyUrl, string? returnUrl, string? cancelUrl, CancellationToken cancellationToken = default)
        {
            if (amount <= 0)
                throw new ArgumentException("Top-up amount must be greater than zero");

            var profile = await _profileRepository.GetByIdAsync(profileId, cancellationToken)
                ?? throw new InvalidOperationException("Profile not found");

            var identityUser = await _userManager.FindByIdAsync(profile.IdentityUserId);

            string? itemName = null;
            string? tenantId = null;
            if (!string.IsNullOrEmpty(siteId))
            {
                var site = await _siteRepository.GetSiteWithDetailsAsync(siteId, cancellationToken);
                if (site != null)
                {
                    tenantId = site.TenantId;
                    var raw = string.IsNullOrEmpty(site.Tenant?.Name)
                        ? $"{site.Name} - AuraConnect - Wallet Top-Up R{amount:F2}"
                        : $"{site.Name} - {site.Tenant.Name} - AuraConnect - Wallet Top-Up R{amount:F2}";
                    itemName = raw.Length > 100 ? raw[..100] : raw;
                }
            }
            itemName ??= $"AuraConnect - Wallet Top-Up R{amount:F2}";

            var reference = Guid.NewGuid().ToString("N");

            var walletTx = new WalletTransaction(profileId, WalletTransactionType.TopUp, amount, "ZAR", reference);
            await _walletTransactionRepository.AddAsync(walletTx, cancellationToken);
            await _walletTransactionRepository.SaveChangesAsync(cancellationToken);

            var (action, fields) = await _payFast.CreatePaymentFormAsync(
                amount, itemName, reference,
                notifyUrl, returnUrl, cancelUrl,
                buyerFirstName: profile.FirstName,
                buyerLastName: profile.LastName,
                buyerEmail: identityUser?.Email,
                customStr1: siteId,
                customStr2: tenantId);

            return new TopUpResponse { Reference = reference, Amount = amount, PayFastAction = action, PayFastFields = fields };
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

            ipnData.TryGetValue("pf_payment_id", out var pfPaymentId);
            decimal? amountFee = ipnData.TryGetValue("amount_fee", out var feeStr) && decimal.TryParse(feeStr, out var fee) ? fee : null;
            decimal? amountNet = ipnData.TryGetValue("amount_net", out var netStr) && decimal.TryParse(netStr, out var net) ? net : null;

            walletTx.Complete(pfPaymentId, amountFee, amountNet);
            await _walletTransactionRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Top-up completed for profile {ProfileId} — R{Amount} credited (pf_payment_id={PfPaymentId} fee={Fee})", walletTx.ProfileId, walletTx.Amount, pfPaymentId, amountFee);
        }

        public async Task<UserPackageResponse> PurchasePackageAsync(string profileId, string packageId, CancellationToken cancellationToken = default)
        {
            var package = await _packageRepository.GetByIdAsync(packageId, cancellationToken)
                ?? throw new InvalidOperationException("Package not found");

            if (!package.IsActive)
                throw new InvalidOperationException("Package is not available");

            if (!package.RadiusProfileId.HasValue || package.RadiusProfileId <= 0)
                throw new InvalidOperationException("Package is not ready for purchase — RADIUS profile not configured");

            var siteId = package.SiteId!;

            var radiusConfig = await _radiusConfigRepository.GetBySiteIdAsync(siteId, cancellationToken);
            if (radiusConfig == null
                || string.IsNullOrWhiteSpace(radiusConfig.RadiusDeskUrl)
                || string.IsNullOrWhiteSpace(radiusConfig.RadiusDeskApiToken)
                || string.IsNullOrWhiteSpace(radiusConfig.RadiusDeskRealmId))
                throw new InvalidOperationException("This site is not configured for RADIUS authentication");

            var rdConfig = new RdSiteConfig(
                radiusConfig.RadiusDeskUrl,
                radiusConfig.RadiusDeskApiToken,
                radiusConfig.RadiusDeskRealmId,
                radiusConfig.RadiusDeskCloudId);

            var profile = await _profileRepository.GetByIdAsync(profileId, cancellationToken)
                ?? throw new InvalidOperationException("Profile not found");

            var identityUser = await _userManager.FindByIdAsync(profile.IdentityUserId)
                ?? throw new InvalidOperationException("User account not found");

            var existingUserPackage = await _userPackageRepository.GetLatestByProfileAndSiteAsync(profileId, siteId, cancellationToken);

            DateTime? toDate = package.DurationDays > 0
                ? DateTime.UtcNow.AddDays(package.DurationDays)
                : null;

            var reference = Guid.NewGuid().ToString("N");

            // Debit wallet — roll back RD provisioning if this fails
            var debited = await _profileRepository.DebitBalanceAsync(profileId, package.Price, cancellationToken);
            if (!debited)
                throw new InvalidOperationException($"Insufficient funds. Required: R{package.Price:F2}");

            string rdUsername;
            string rdPassword;
            int rdUserId;

            if (existingUserPackage?.RdUserId != null)
            {
                // Renewal — reuse existing credentials, extend expiry and update profile
                rdUsername = existingUserPackage.RdUsername!;
                rdPassword = existingUserPackage.RdPassword!;
                rdUserId   = existingUserPackage.RdUserId.Value;

                var ok = await _radiusProvisioning.UpdateUserAsync(rdConfig, new RdUpdateUserRequest(
                    rdUserId,
                    ProfileId: package.RadiusProfileId,
                    ToDate: toDate,
                    Active: true));

                if (!ok)
                {
                    await _profileRepository.CreditBalanceAsync(profileId, package.Price, cancellationToken);
                    throw new InvalidOperationException("Failed to update RADIUS user — purchase rolled back");
                }
            }
            else
            {
                // New provisioning
                rdPassword = Guid.NewGuid().ToString("N")[..12];

                var provisionResult = await _radiusProvisioning.ProvisionUserAsync(rdConfig, new RdProvisionRequest(
                    Username:  identityUser.Email!,
                    Password:  rdPassword,
                    ProfileId: package.RadiusProfileId!.Value,
                    FromDate:  DateTime.UtcNow,
                    ToDate:    toDate,
                    FirstName: profile.FirstName,
                    LastName:  profile.LastName,
                    Email:     identityUser.Email));

                if (!provisionResult.Success || provisionResult.RdUsername == null || provisionResult.RdUserId == null)
                {
                    await _profileRepository.CreditBalanceAsync(profileId, package.Price, cancellationToken);
                    throw new InvalidOperationException($"Failed to provision RADIUS user — purchase rolled back: {provisionResult.Error}");
                }

                rdUsername = provisionResult.RdUsername;
                rdUserId   = provisionResult.RdUserId.Value;
            }

            // Cancel previous active package for this site
            if (existingUserPackage != null)
            {
                existingUserPackage.Cancel();
                await _userPackageRepository.UpdateAsync(existingUserPackage, cancellationToken);
            }

            var walletTx = new WalletTransaction(profileId, WalletTransactionType.PackagePurchase, package.Price, "ZAR", reference);
            walletTx.Complete();
            await _walletTransactionRepository.AddAsync(walletTx, cancellationToken);

            var userPackage = new UserPackage(profileId, packageId, siteId, reference, toDate);
            userPackage.SetRadiusCredentials(rdUsername, rdPassword, rdUserId);
            await _userPackageRepository.AddAsync(userPackage, cancellationToken);

            await _walletTransactionRepository.SaveChangesAsync(cancellationToken);
            await _userPackageRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Package {PackageId} purchased by profile {ProfileId} — RdUsername={RdUsername} ExpiresAt={ExpiresAt}",
                packageId, profileId, rdUsername, toDate);

            return new UserPackageResponse
            {
                Id = userPackage.Id,
                PackageId = packageId,
                PackageName = package.Name,
                SiteId = siteId,
                AmountPaid = package.Price,
                Currency = "ZAR",
                Status = userPackage.Status.ToString(),
                PurchasedAt = userPackage.PurchasedAt,
                ExpiresAt = userPackage.ExpiresAt
            };
        }

        public async Task<PackageCredentialsResponse?> GetPackageCredentialsAsync(string userPackageId, string? profileId, CancellationToken cancellationToken = default)
        {
            var userPackage = await _userPackageRepository.GetByIdAsync(userPackageId, cancellationToken);
            if (userPackage == null) return null;
            if (profileId != null && userPackage.ProfileId != profileId) return null;
            if (userPackage.RdUsername == null || userPackage.RdPassword == null) return null;

            string? gatewayUrl = null;
            var radiusConfig = await _radiusConfigRepository.GetBySiteIdAsync(userPackage.SiteId, cancellationToken);
            if (radiusConfig != null) gatewayUrl = radiusConfig.GatewayUrl;

            return new PackageCredentialsResponse
            {
                RdUsername = userPackage.RdUsername,
                RdPassword = userPackage.RdPassword,
                GatewayUrl = gatewayUrl
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

        public async Task SetUserPackageActiveAsync(string userPackageId, bool active, CancellationToken cancellationToken = default)
        {
            var userPackage = await _userPackageRepository.GetByIdAsync(userPackageId, cancellationToken)
                ?? throw new InvalidOperationException("User package not found");

            if (userPackage.RdUserId == null)
                throw new InvalidOperationException("This user package has no RADIUS user to enable/disable");

            var radiusConfig = await _radiusConfigRepository.GetBySiteIdAsync(userPackage.SiteId, cancellationToken);
            if (radiusConfig == null
                || string.IsNullOrWhiteSpace(radiusConfig.RadiusDeskUrl)
                || string.IsNullOrWhiteSpace(radiusConfig.RadiusDeskApiToken)
                || string.IsNullOrWhiteSpace(radiusConfig.RadiusDeskRealmId))
                throw new InvalidOperationException("Site RADIUS configuration is incomplete");

            var rdConfig = new RdSiteConfig(
                radiusConfig.RadiusDeskUrl,
                radiusConfig.RadiusDeskApiToken,
                radiusConfig.RadiusDeskRealmId,
                radiusConfig.RadiusDeskCloudId);

            var ok = await _radiusProvisioning.UpdateUserAsync(rdConfig, new RdUpdateUserRequest(
                userPackage.RdUserId.Value, Active: active));

            if (!ok)
                throw new InvalidOperationException($"Failed to {(active ? "enable" : "disable")} RADIUS user");

            _logger.LogInformation("UserPackage {UserPackageId} RADIUS user {Action} by admin",
                userPackageId, active ? "enabled" : "disabled");
        }

        private static WalletTransactionResponse MapTransaction(WalletTransaction t) => new()
        {
            Id = t.Id,
            Type = t.Type.ToString(),
            Amount = t.Amount,
            Currency = t.Currency,
            Reference = t.Reference,
            Status = t.Status,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt,
            PayFastPaymentId = t.PayFastPaymentId,
            AmountFee = t.AmountFee,
            AmountNet = t.AmountNet
        };
    }
}
