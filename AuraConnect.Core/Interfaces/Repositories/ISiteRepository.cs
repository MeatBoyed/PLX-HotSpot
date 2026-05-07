using AuraConnect.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Core.Interfaces.Repositories
{
    public interface ISiteRepository
    {
        // Basic CRUD
        Task<Site?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<Site?> GetBySsidAsync(string ssid, CancellationToken cancellationToken = default);
        Task<IEnumerable<Site>> GetByTenantIdAsync(string tenantId, CancellationToken cancellationToken = default);

        // With includes (for detailed views)
        Task<Site?> GetSiteWithDetailsAsync(string id, CancellationToken cancellationToken = default);
        Task<Site?> GetBySsidWithBrandingAsync(string ssid, CancellationToken cancellationToken = default);

        // Validation
        Task<bool> ExistsAsync(string ssid, CancellationToken cancellationToken = default);
        Task<bool> ExistsInTenantAsync(string tenantId, string ssid, CancellationToken cancellationToken = default);

        // Commands
        Task AddAsync(Site site, CancellationToken cancellationToken = default);
        Task UpdateAsync(Site site, CancellationToken cancellationToken = default);
        Task DeleteAsync(Site site, CancellationToken cancellationToken = default);
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
