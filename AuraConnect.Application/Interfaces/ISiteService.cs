using AuraConnect.Application.DTOs.Portal;
using AuraConnect.Application.DTOs.Site;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.Interfaces
{
    public interface ISiteService
    {
        // Portal
        Task<IEnumerable<PortalSiteResponse>> GetPortalSitesAsync(string tenantId, CancellationToken cancellationToken = default);

        // Site CRUD
        Task<IEnumerable<SiteResponse>> GetSitesByTenantAsync(string tenantId, CancellationToken cancellationToken = default);
        Task<SiteResponse?> GetSiteByIdAsync(string siteId, CancellationToken cancellationToken = default);
        Task<SiteResponse> CreateSiteAsync(string tenantId, CreateSiteRequest request, CancellationToken cancellationToken = default);
        Task<SiteResponse> UpdateSiteAsync(string siteId, UpdateSiteRequest request, CancellationToken cancellationToken = default);
        Task DeleteSiteAsync(string siteId, CancellationToken cancellationToken = default);

        // Status management
        Task<SiteResponse> UpdateSiteStatusAsync(string siteId, UpdateSiteStatusRequest request, CancellationToken cancellationToken = default);
    }
}
