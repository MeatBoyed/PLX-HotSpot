using AuraConnect.Application.DTOs.Package;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;

namespace AuraConnect.Infrastructure.Services
{
    public class PackageService : IPackageService
    {
        private readonly IPackageRepository _packageRepository;
        private readonly ISiteRepository _siteRepository;

        public PackageService(IPackageRepository packageRepository, ISiteRepository siteRepository)
        {
            _packageRepository = packageRepository;
            _siteRepository = siteRepository;
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
            var site = await _siteRepository.GetByIdAsync(siteId, cancellationToken)
                ?? throw new InvalidOperationException("Site not found");

            var package = new Package(siteId, request.Name, request.RadiusProfile, request.Price);

            if (request.Description != null) package.SetDescription(request.Description);
            if (request.RadiusRealmId != null) package.SetRadiusRealmId(request.RadiusRealmId);
            if (request.RadiusCloudId != null) package.SetRadiusCloudId(request.RadiusCloudId);
            if (request.RadiusProfileId != null) package.SetRadiusProfileId(request.RadiusProfileId);
            package.SetSortOrder(request.SortOrder);

            await _packageRepository.AddAsync(package, cancellationToken);
            await _packageRepository.SaveChangesAsync(cancellationToken);

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
            if (request.RadiusRealmId != null) package.SetRadiusRealmId(request.RadiusRealmId);
            if (request.RadiusCloudId != null) package.SetRadiusCloudId(request.RadiusCloudId);
            if (request.RadiusProfileId != null) package.SetRadiusProfileId(request.RadiusProfileId);
            if (request.SortOrder.HasValue) package.SetSortOrder(request.SortOrder.Value);

            if (request.IsActive.HasValue)
            {
                if (request.IsActive.Value) package.Activate();
                else package.Deactivate();
            }

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

        private static PackageResponse MapToResponse(Package p) => new()
        {
            Id = p.Id,
            SiteId = p.SiteId ?? string.Empty,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            RadiusProfile = p.RadiusProfile,
            RadiusRealmId = p.RadiusRealmId,
            RadiusCloudId = p.RadiusCloudId,
            RadiusProfileId = p.RadiusProfileId,
            IsActive = p.IsActive,
            SortOrder = p.SortOrder,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };

        private static PortalPackageResponse MapToPortalResponse(Package p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Currency = "ZAR",
            IsFree = p.IsFree(),
            SortOrder = p.SortOrder
        };
    }
}
