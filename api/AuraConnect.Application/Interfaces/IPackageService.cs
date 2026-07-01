using AuraConnect.Application.DTOs.Package;

namespace AuraConnect.Application.Interfaces
{
    public interface IPackageService
    {
        Task<IEnumerable<PackageResponse>> GetBySiteIdAsync(string siteId, CancellationToken cancellationToken = default);
        Task<PackageResponse> GetByIdAsync(string siteId, string packageId, CancellationToken cancellationToken = default);
        Task<PackageResponse> CreateAsync(string siteId, CreatePackageRequest request, CancellationToken cancellationToken = default);
        Task<PackageResponse> UpdateAsync(string siteId, string packageId, UpdatePackageRequest request, CancellationToken cancellationToken = default);
        Task DeactivateAsync(string siteId, string packageId, CancellationToken cancellationToken = default);
        Task<IEnumerable<PortalPackageResponse>> GetPortalPackagesAsync(string tenantId, string ssid, CancellationToken cancellationToken = default);
    }
}
