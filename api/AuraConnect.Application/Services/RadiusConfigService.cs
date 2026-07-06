using AuraConnect.Application.DTOs.Portal;
using AuraConnect.Application.DTOs.Radius;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;

namespace AuraConnect.Application.Services
{
    public class RadiusConfigService : IRadiusConfigService
    {
        private readonly IRadiusConfigRepository _radiusConfigRepository;
        private readonly ISiteRepository _siteRepository;
        private readonly IPortalCacheService _portalCache;

        public RadiusConfigService(IRadiusConfigRepository radiusConfigRepository, ISiteRepository siteRepository, IPortalCacheService portalCache)
        {
            _radiusConfigRepository = radiusConfigRepository;
            _siteRepository = siteRepository;
            _portalCache = portalCache;
        }

        public async Task<RadiusConfigResponse?> GetRadiusConfigAsync(string siteId, CancellationToken cancellationToken = default)
        {
            var site = await _siteRepository.GetByIdAsync(siteId, cancellationToken);
            if (site == null)
                throw new InvalidOperationException($"Site with ID '{siteId}' not found");

            var config = await _radiusConfigRepository.GetBySiteIdAsync(siteId, cancellationToken);
            return config == null ? null : MapToResponse(config);
        }

        public async Task<RadiusConfigResponse> UpsertRadiusConfigAsync(string siteId, UpdateRadiusConfigRequest request, CancellationToken cancellationToken = default)
        {
            var site = await _siteRepository.GetByIdAsync(siteId, cancellationToken);
            if (site == null)
                throw new InvalidOperationException($"Site with ID '{siteId}' not found");

            var config = await _radiusConfigRepository.GetBySiteIdAsync(siteId, cancellationToken);
            var isNew = config == null;

            if (isNew)
                config = new RadiusConfig(siteId);

            if (request.GatewayUrl != null) config!.SetGatewayUrl(request.GatewayUrl);
            if (request.FreeUsername != null) config!.SetFreeUsername(request.FreeUsername);
            if (request.FreePassword != null) config!.SetFreePassword(request.FreePassword);
            if (request.RadiusDeskUrl != null) config!.SetRadiusDeskUrl(request.RadiusDeskUrl);
            if (request.RadiusDeskApiToken != null) config!.SetRadiusDeskApiToken(request.RadiusDeskApiToken);
            if (request.RadiusDeskRealmId != null) config!.SetRadiusDeskRealmId(request.RadiusDeskRealmId);
            if (request.RadiusDeskCloudId != null) config!.SetRadiusDeskCloudId(request.RadiusDeskCloudId);

            if (isNew)
                await _radiusConfigRepository.AddAsync(config!, cancellationToken);
            else
                await _radiusConfigRepository.UpdateAsync(config!, cancellationToken);

            await _radiusConfigRepository.SaveChangesAsync(cancellationToken);

            _portalCache.InvalidateGatewayConfig(site.Ssid);

            return MapToResponse(config!);
        }

        public async Task<GatewayConfigResponse> GetGatewayConfigAsync(string tenantId, string ssid, CancellationToken cancellationToken = default)
        {
            var cached = _portalCache.GetGatewayConfig(ssid);
            if (cached != null)
                return cached;

            var site = await _siteRepository.GetBySsidAsync(ssid, cancellationToken);

            if (site == null || site.TenantId != tenantId)
                throw new InvalidOperationException($"No site found for SSID '{ssid}' under this tenant");

            var config = await _radiusConfigRepository.GetBySiteIdAsync(site.Id, cancellationToken);
            if (config == null)
                throw new InvalidOperationException($"No gateway configuration found for SSID '{ssid}'");

            var response = new GatewayConfigResponse
            {
                LoginUrl = config.GatewayUrl != null ? $"{config.GatewayUrl.TrimEnd('/')}/login" : null,
                FreeUsername = config.FreeUsername,
                FreePassword = config.FreePassword
            };

            _portalCache.SetGatewayConfig(ssid, response);
            return response;
        }

        private static RadiusConfigResponse MapToResponse(RadiusConfig config) => new()
        {
            SiteId = config.SiteId!,
            GatewayUrl = config.GatewayUrl,
            FreeUsername = config.FreeUsername,
            FreePassword = config.FreePassword,
            RadiusDeskUrl = config.RadiusDeskUrl,
            RadiusDeskApiToken = config.RadiusDeskApiToken,
            RadiusDeskRealmId = config.RadiusDeskRealmId,
            RadiusDeskCloudId = config.RadiusDeskCloudId,
            CreatedAt = config.CreatedAt,
            UpdatedAt = config.UpdatedAt
        };
    }
}
