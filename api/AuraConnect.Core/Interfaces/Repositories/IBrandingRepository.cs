using AuraConnect.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Core.Interfaces.Repositories
{
    public interface IBrandingRepository
    {
        Task<Branding?> GetBySiteIdAsync(string siteId, CancellationToken cancellationToken = default);
        Task AddAsync(Branding branding, CancellationToken cancellationToken = default);
        Task UpdateAsync(Branding branding, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(string siteId, CancellationToken cancellationToken = default);

        Task<BrandingImage?> GetImageAsync(string siteId, BrandingImageType imageType, CancellationToken cancellationToken = default);
        Task SaveImageAsync(BrandingImage image, CancellationToken cancellationToken = default);

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
