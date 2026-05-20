using AuraConnect.Application.DTOs.Package;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace AuraConnect.Infrastructure.Services
{
    public class PackageService : IPackageService
    {
        private readonly IPackageRepository _packageRepository;
        private readonly ISiteRepository _siteRepository;
        private readonly IRadiusConfigRepository _radiusConfigRepository;
        private readonly IRadiusProvisioningService _radiusProvisioning;
        private readonly ILogger<PackageService> _logger;

        public PackageService(
            IPackageRepository packageRepository,
            ISiteRepository siteRepository,
            IRadiusConfigRepository radiusConfigRepository,
            IRadiusProvisioningService radiusProvisioning,
            ILogger<PackageService> logger)
        {
            _packageRepository = packageRepository;
            _siteRepository = siteRepository;
            _radiusConfigRepository = radiusConfigRepository;
            _radiusProvisioning = radiusProvisioning;
            _logger = logger;
        }

        public async Task<IEnumerable<PackageResponse>> GetBySiteIdAsync(string siteId, CancellationToken cancellationToken = default)
        {
            var packages = await _packageRepository.GetBySiteIdAllAsync(siteId, cancellationToken);
            return packages.Select(MapToResponse);
        }

        public async Task<PackageResponse> GetByIdAsync(string siteId, string packageId, CancellationToken cancellationToken = default)
        {
            var package = await _packageRepository.GetByIdAsync(packageId, cancellationToken)
                ?? throw new InvalidOperationException("Package not found");

            if (package.SiteId != siteId)
                throw new InvalidOperationException("Package not found");

            return MapToResponse(package);
        }

        public async Task<PackageResponse> CreateAsync(string siteId, CreatePackageRequest request, CancellationToken cancellationToken = default)
        {
            _ = await _siteRepository.GetByIdAsync(siteId, cancellationToken)
                ?? throw new InvalidOperationException("Site not found");

            var radiusConfig = await _radiusConfigRepository.GetBySiteIdAsync(siteId, cancellationToken);
            var rdConfig = BuildRdSiteConfig(radiusConfig);

            if (rdConfig == null)
                throw new InvalidOperationException(
                    "This site's RADIUS configuration is incomplete. Set RadiusDesk URL, API token, Realm ID and Cloud ID before creating packages.");

            var package = new Package(siteId, request.Name, request.RadiusProfile, request.Price);
            if (request.Description != null) package.SetDescription(request.Description);
            package.SetSortOrder(request.SortOrder);
            package.SetDurationDays(request.DurationDays);
            package.SetLimits(
                request.DataLimitEnabled, request.DataAmount, request.DataUnit, request.DataReset, request.DataCap,
                request.TimeLimitEnabled, request.TimeAmount, request.TimeUnit, request.TimeReset, request.TimeCap,
                request.SpeedLimitEnabled, request.SpeedUploadAmount, request.SpeedUploadUnit, request.SpeedDownloadAmount, request.SpeedDownloadUnit,
                request.SessionLimitEnabled, request.SessionLimit);

            var profileResult = await _radiusProvisioning.CreateProfileAsync(rdConfig, BuildRdProfileRequest(package), cancellationToken);
            if (!profileResult.Success)
                throw new InvalidOperationException($"Failed to create RadiusDesk profile: {profileResult.Error}");

            package.SetRadiusProfileId(profileResult.RdProfileId);

            await _packageRepository.AddAsync(package, cancellationToken);
            await _packageRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Package {PackageId} created with RD profile id={RdProfileId}", package.Id, profileResult.RdProfileId);
            return MapToResponse(package);
        }

        public async Task<PackageResponse> UpdateAsync(string siteId, string packageId, UpdatePackageRequest request, CancellationToken cancellationToken = default)
        {
            var package = await _packageRepository.GetByIdAsync(packageId, cancellationToken)
                ?? throw new InvalidOperationException("Package not found");

            if (package.SiteId != siteId)
                throw new InvalidOperationException("Package not found");

            if (!string.IsNullOrWhiteSpace(request.Name)) package.SetName(request.Name);
            if (request.Description != null) package.SetDescription(request.Description);
            if (request.Price.HasValue) package.SetPrice(request.Price.Value);
            if (!string.IsNullOrWhiteSpace(request.RadiusProfile)) package.SetRadiusProfile(request.RadiusProfile);
            if (request.SortOrder.HasValue) package.SetSortOrder(request.SortOrder.Value);
            if (request.DurationDays.HasValue) package.SetDurationDays(request.DurationDays.Value);

            if (request.IsActive.HasValue)
            {
                if (request.IsActive.Value) package.Activate();
                else package.Deactivate();
            }

            var limitsChanged = request.DataLimitEnabled.HasValue || request.DataAmount.HasValue || request.DataUnit != null ||
                                request.TimeLimitEnabled.HasValue || request.TimeAmount.HasValue ||
                                request.SpeedLimitEnabled.HasValue || request.SpeedUploadAmount.HasValue || request.SpeedDownloadAmount.HasValue ||
                                request.SessionLimitEnabled.HasValue || request.SessionLimit.HasValue;

            if (limitsChanged)
            {
                package.SetLimits(
                    request.DataLimitEnabled ?? package.DataLimitEnabled,
                    request.DataAmount ?? package.DataAmount, request.DataUnit ?? package.DataUnit,
                    request.DataReset ?? package.DataReset, request.DataCap ?? package.DataCap,
                    request.TimeLimitEnabled ?? package.TimeLimitEnabled,
                    request.TimeAmount ?? package.TimeAmount, request.TimeUnit ?? package.TimeUnit,
                    request.TimeReset ?? package.TimeReset, request.TimeCap ?? package.TimeCap,
                    request.SpeedLimitEnabled ?? package.SpeedLimitEnabled,
                    request.SpeedUploadAmount ?? package.SpeedUploadAmount, request.SpeedUploadUnit ?? package.SpeedUploadUnit,
                    request.SpeedDownloadAmount ?? package.SpeedDownloadAmount, request.SpeedDownloadUnit ?? package.SpeedDownloadUnit,
                    request.SessionLimitEnabled ?? package.SessionLimitEnabled,
                    request.SessionLimit ?? package.SessionLimit);

                if (package.RadiusProfileId.HasValue && package.RadiusProfileId > 0)
                {
                    var radiusConfig = await _radiusConfigRepository.GetBySiteIdAsync(siteId, cancellationToken);
                    var rdConfig = BuildRdSiteConfig(radiusConfig);
                    if (rdConfig != null)
                    {
                        var ok = await _radiusProvisioning.UpdateProfileAsync(rdConfig, package.RadiusProfileId.Value, BuildRdProfileRequest(package), cancellationToken);
                        if (!ok) throw new InvalidOperationException("Failed to update RadiusDesk profile. Package not saved.");
                    }
                }
            }

            await _packageRepository.UpdateAsync(package, cancellationToken);
            await _packageRepository.SaveChangesAsync(cancellationToken);

            return MapToResponse(package);
        }

        public async Task DeactivateAsync(string siteId, string packageId, CancellationToken cancellationToken = default)
        {
            var package = await _packageRepository.GetByIdAsync(packageId, cancellationToken)
                ?? throw new InvalidOperationException("Package not found");

            if (package.SiteId != siteId)
                throw new InvalidOperationException("Package not found");

            package.Deactivate();
            await _packageRepository.UpdateAsync(package, cancellationToken);
            await _packageRepository.SaveChangesAsync(cancellationToken);
        }

        public async Task<IEnumerable<PortalPackageResponse>> GetPortalPackagesAsync(string tenantId, string ssid, CancellationToken cancellationToken = default)
        {
            var site = await _siteRepository.GetBySsidAsync(ssid, cancellationToken);
            if (site == null || site.TenantId != tenantId)
                throw new InvalidOperationException("Site not found");

            var packages = await _packageRepository.GetBySiteIdAsync(site.Id, cancellationToken);
            return packages.Select(MapToPortalResponse);
        }

        // ── Helpers ─────────────────────────────────────────────────────────────

        private static RdSiteConfig? BuildRdSiteConfig(RadiusConfig? config)
        {
            if (config == null ||
                string.IsNullOrWhiteSpace(config.RadiusDeskUrl) ||
                string.IsNullOrWhiteSpace(config.RadiusDeskApiToken) ||
                string.IsNullOrWhiteSpace(config.RadiusDeskRealmId))
                return null;

            return new RdSiteConfig(config.RadiusDeskUrl, config.RadiusDeskApiToken, config.RadiusDeskRealmId, config.RadiusDeskCloudId);
        }

        private static RdProfileRequest BuildRdProfileRequest(Package p) => new(
            p.RadiusProfile,
            p.DataLimitEnabled, p.DataAmount, p.DataUnit, p.DataReset, p.DataCap,
            p.TimeLimitEnabled, p.TimeAmount, p.TimeUnit, p.TimeReset, p.TimeCap,
            p.SpeedLimitEnabled, p.SpeedUploadAmount, p.SpeedUploadUnit, p.SpeedDownloadAmount, p.SpeedDownloadUnit,
            p.SessionLimitEnabled, p.SessionLimit);

        private static PackageResponse MapToResponse(Package p) => new()
        {
            Id = p.Id,
            SiteId = p.SiteId ?? string.Empty,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            RadiusProfile = p.RadiusProfile,
            RadiusProfileId = p.RadiusProfileId,
            IsActive = p.IsActive,
            SortOrder = p.SortOrder,
            DurationDays = p.DurationDays,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            DataLimitEnabled = p.DataLimitEnabled, DataAmount = p.DataAmount, DataUnit = p.DataUnit, DataReset = p.DataReset, DataCap = p.DataCap,
            TimeLimitEnabled = p.TimeLimitEnabled, TimeAmount = p.TimeAmount, TimeUnit = p.TimeUnit, TimeReset = p.TimeReset, TimeCap = p.TimeCap,
            SpeedLimitEnabled = p.SpeedLimitEnabled, SpeedUploadAmount = p.SpeedUploadAmount, SpeedUploadUnit = p.SpeedUploadUnit,
            SpeedDownloadAmount = p.SpeedDownloadAmount, SpeedDownloadUnit = p.SpeedDownloadUnit,
            SessionLimitEnabled = p.SessionLimitEnabled, SessionLimit = p.SessionLimit
        };

        private static PortalPackageResponse MapToPortalResponse(Package p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Currency = "ZAR",
            IsFree = p.IsFree(),
            SortOrder = p.SortOrder,
            DurationDays = p.DurationDays,
            DataLimitEnabled = p.DataLimitEnabled, DataAmount = p.DataAmount, DataUnit = p.DataUnit, DataReset = p.DataReset,
            TimeLimitEnabled = p.TimeLimitEnabled, TimeAmount = p.TimeAmount, TimeUnit = p.TimeUnit,
            SpeedLimitEnabled = p.SpeedLimitEnabled, SpeedDownloadAmount = p.SpeedDownloadAmount, SpeedDownloadUnit = p.SpeedDownloadUnit,
            SpeedUploadAmount = p.SpeedUploadAmount, SpeedUploadUnit = p.SpeedUploadUnit,
            SessionLimitEnabled = p.SessionLimitEnabled, SessionLimit = p.SessionLimit
        };
    }
}
