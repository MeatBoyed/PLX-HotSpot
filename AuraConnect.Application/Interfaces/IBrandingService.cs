using AuraConnect.Application.DTOs.Branding;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.Interfaces
{
    public interface IBrandingService
    {
        Task<BrandingResponse?> GetBrandingAsync(string siteId, CancellationToken cancellationToken = default);
        Task<BrandingResponse> UpdateBrandingAsync(string siteId, UpdateBrandingRequest request, CancellationToken cancellationToken = default);
        Task<BrandingResponse> UpdateColorsAsync(string siteId, UpdateColorsRequest request, CancellationToken cancellationToken = default);
        Task<BrandingResponse> UpdateImagesAsync(string siteId, UpdateImagesRequest request, CancellationToken cancellationToken = default);
        Task<BrandingResponse> UpdateContentAsync(string siteId, UpdateContentRequest request, CancellationToken cancellationToken = default);
    }
}
