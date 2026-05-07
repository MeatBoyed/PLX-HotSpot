using AuraConnect.Application.DTOs.Branding;
using AuraConnect.Application.DTOs.Portal;
using AuraConnect.Core.Entities;

namespace AuraConnect.Application.Interfaces
{
    public interface IBrandingService
    {
        Task<BrandingResponse?> GetBrandingAsync(string siteId, CancellationToken cancellationToken = default);
        Task<BrandingResponse> UpdateBrandingAsync(string siteId, UpdateBrandingRequest request, CancellationToken cancellationToken = default);
        Task<BrandingResponse> UpdateColorsAsync(string siteId, UpdateColorsRequest request, CancellationToken cancellationToken = default);
        Task<BrandingResponse> UpdateImagesAsync(string siteId, UpdateImagesRequest request, CancellationToken cancellationToken = default);
        Task<BrandingResponse> UpdateContentAsync(string siteId, UpdateContentRequest request, CancellationToken cancellationToken = default);
        Task<BrandingResponse> UploadImageAsync(string siteId, BrandingImageType imageType, Stream data, string fileName, string contentType, CancellationToken cancellationToken = default);
        Task<BrandingImageData?> GetImageAsync(string siteId, BrandingImageType imageType, CancellationToken cancellationToken = default);
        Task<PortalBrandingResponse> GetPortalBrandingAsync(string tenantId, string ssid, CancellationToken cancellationToken = default);
    }
}
