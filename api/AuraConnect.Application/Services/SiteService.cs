using AuraConnect.Application.DTOs.Portal;
using AuraConnect.Application.DTOs.Site;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.Services
{
    public class SiteService : ISiteService
    {
        private readonly ISiteRepository _siteRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IPortalCacheService _portalCache;

        public SiteService(ISiteRepository siteRepository, ITenantRepository tenantRepository, IPortalCacheService portalCache)
        {
            _siteRepository = siteRepository;
            _tenantRepository = tenantRepository;
            _portalCache = portalCache;
        }

        // GET portal site list for a tenant (site selector page)
        public async Task<IEnumerable<PortalSiteResponse>> GetPortalSitesAsync(string tenantId, CancellationToken cancellationToken = default)
        {
            var cached = _portalCache.GetSites(tenantId);
            if (cached != null)
                return cached;

            var sites = await _siteRepository.GetByTenantIdWithBrandingAsync(tenantId, cancellationToken);
            var response = sites.Select(s => new PortalSiteResponse
            {
                Ssid = s.Ssid,
                DisplayName = s.Branding?.DisplayName,
                LogoUrl = s.Branding?.LogoUrl ?? "/logo-default.svg",
                SortOrder = s.SortOrder
            }).ToList();

            _portalCache.SetSites(tenantId, response);
            return response;
        }

        // GET all sites for a tenant
        public async Task<IEnumerable<SiteResponse>> GetSitesByTenantAsync(string tenantId, CancellationToken cancellationToken = default)
        {
            // 1. Verify tenant exists
            var tenant = await _tenantRepository.GetByIdAsync(tenantId, cancellationToken);
            if (tenant == null)
                throw new InvalidOperationException($"Tenant with ID '{tenantId}' not found");

            // 2. Get sites from repository
            var sites = await _siteRepository.GetByTenantIdAsync(tenantId, cancellationToken);

            // 3. Convert to DTOs
            return sites.Select(site => MapToResponse(site, tenant.Name));
        }

        // GET single site by ID
        public async Task<SiteResponse?> GetSiteByIdAsync(string siteId, CancellationToken cancellationToken = default)
        {
            var site = await _siteRepository.GetSiteWithDetailsAsync(siteId, cancellationToken);
            if (site == null)
                return null;

            var tenant = await _tenantRepository.GetByIdAsync(site.TenantId, cancellationToken);

            return MapToResponse(site, tenant?.Name);
        }

        // POST create new site
        public async Task<SiteResponse> CreateSiteAsync(string tenantId, CreateSiteRequest request, CancellationToken cancellationToken = default)
        {
            // 1. Verify tenant exists
            var tenant = await _tenantRepository.GetByIdAsync(tenantId, cancellationToken);
            if (tenant == null)
                throw new InvalidOperationException($"Tenant with ID '{tenantId}' not found");

            // 2. Check if SSID is unique within this tenant
            var ssidExists = await _siteRepository.ExistsInTenantAsync(tenantId, request.Ssid, cancellationToken);
            if (ssidExists)
                throw new InvalidOperationException($"Site with SSID '{request.Ssid}' already exists in this tenant");

            // 3. Create entity
            var site = new Site(tenantId, request.Ssid, request.Name, request.Domain);
            site.SetSuccessRedirectUrl(request.SuccessRedirectUrl);
            site.SetSortOrder(request.SortOrder);

            // 4. Save
            await _siteRepository.AddAsync(site, cancellationToken);
            await _siteRepository.SaveChangesAsync(cancellationToken);

            _portalCache.InvalidateSites(tenantId);

            return MapToResponse(site, tenant.Name);
        }

        // PUT update site
        public async Task<SiteResponse> UpdateSiteAsync(string siteId, UpdateSiteRequest request, CancellationToken cancellationToken = default)
        {
            // 1. Get existing site
            var site = await _siteRepository.GetByIdAsync(siteId, cancellationToken);
            if (site == null)
                throw new InvalidOperationException($"Site with ID '{siteId}' not found");

            // 2. If SSID is changing, check uniqueness within tenant
            if (site.Ssid != request.Ssid)
            {
                var ssidExists = await _siteRepository.ExistsInTenantAsync(site.TenantId, request.Ssid, cancellationToken);
                if (ssidExists)
                    throw new InvalidOperationException($"Site with SSID '{request.Ssid}' already exists in this tenant");
            }

            // 3. Update entity
            site.SetSsid(request.Ssid);
            site.SetName(request.Name);
            site.SetDomain(request.Domain);
            site.SetSuccessRedirectUrl(request.SuccessRedirectUrl);
            site.SetSortOrder(request.SortOrder);
            if (request.AuthMethods != null) site.SetAuthMethods(request.AuthMethods);
            if (request.MarketingOptIn.HasValue) site.SetMarketingOptIn(request.MarketingOptIn.Value);
            if (request.RadiusCalledStationIds != null) site.SetRadiusCalledStationIds(request.RadiusCalledStationIds);

            // 4. Save
            await _siteRepository.UpdateAsync(site, cancellationToken);
            await _siteRepository.SaveChangesAsync(cancellationToken);

            _portalCache.InvalidateBranding(site.Ssid);
            _portalCache.InvalidateSites(site.TenantId);

            // 5. Get tenant name for response
            var tenant = await _tenantRepository.GetByIdAsync(site.TenantId, cancellationToken);

            return MapToResponse(site, tenant?.Name);
        }

        // DELETE site
        public async Task DeleteSiteAsync(string siteId, CancellationToken cancellationToken = default)
        {
            // 1. Get site with related data
            var site = await _siteRepository.GetSiteWithDetailsAsync(siteId, cancellationToken);
            if (site == null)
                throw new InvalidOperationException($"Site with ID '{siteId}' not found");

            // 2. BUSINESS RULES: Check if site has dependent data
            //    - Packages? Can't delete if packages exist
            if (site.Packages != null && site.Packages.Any(p => p.IsActive))
            {
                var activePackageCount = site.Packages.Count(p => p.IsActive);
                throw new InvalidOperationException(
                    $"Cannot delete site '{site.Name}' because it has {activePackageCount} active package(s). " +
                    "Deactivate or delete packages first.");
            }

            //    - Has OTP verifications? (Warning only, but still allow)
            if (site.OtpVerifications != null && site.OtpVerifications.Any())
            {
                // Log warning but still delete (or throw exception - your choice)
                // For now, we'll still allow deletion but you might want to archive instead
            }

            // 3. Delete
            await _siteRepository.DeleteAsync(site, cancellationToken);
            await _siteRepository.SaveChangesAsync(cancellationToken);

            _portalCache.InvalidateBranding(site.Ssid);
            _portalCache.InvalidateGatewayConfig(site.Ssid);
            _portalCache.InvalidateSites(site.TenantId);
        }

        // PATCH update status only
        public async Task<SiteResponse> UpdateSiteStatusAsync(string siteId, UpdateSiteStatusRequest request, CancellationToken cancellationToken = default)
        {
            // 1. Get site
            var site = await _siteRepository.GetByIdAsync(siteId, cancellationToken);
            if (site == null)
                throw new InvalidOperationException($"Site with ID '{siteId}' not found");

            // 2. Update status
            site.SetStatus(request.Status);

            // 3. Save
            await _siteRepository.UpdateAsync(site, cancellationToken);
            await _siteRepository.SaveChangesAsync(cancellationToken);

            _portalCache.InvalidateBranding(site.Ssid);
            _portalCache.InvalidateSites(site.TenantId);

            // 4. Return updated site
            var tenant = await _tenantRepository.GetByIdAsync(site.TenantId, cancellationToken);

            return MapToResponse(site, tenant?.Name);
        }

        // Helper method to map Entity → DTO
        private static SiteResponse MapToResponse(Site site, string? tenantName = null)
        {
            return new SiteResponse
            {
                Id = site.Id,
                TenantId = site.TenantId,
                TenantName = tenantName ?? string.Empty,
                Ssid = site.Ssid,
                Name = site.Name,
                Domain = site.Domain,
                SuccessRedirectUrl = site.SuccessRedirectUrl,
                Status = site.Status,
                SortOrder = site.SortOrder,
                AuthMethods = site.AuthMethods,
                MarketingOptIn = site.MarketingOptIn,
                RadiusCalledStationIds = site.RadiusCalledStationIds,
                CreatedAt = site.CreatedAt,
                UpdatedAt = site.UpdatedAt,
                PackageCount = site.Packages?.Count ?? 0,
                HasBranding = site.Branding != null,
                HasRadiusConfig = site.RadiusConfig != null
            };
        }
    }
    }
