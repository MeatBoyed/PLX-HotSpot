using AuraConnect.Application.DTOs.Portal;
using AuraConnect.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace AuraConnect.Infrastructure.Services
{
    public class PortalCacheService : IPortalCacheService
    {
        private readonly IMemoryCache _cache;
        private static readonly TimeSpan Ttl = TimeSpan.FromMinutes(5);

        private static string BrandingKey(string ssid) => $"portal:branding:{ssid}";
        private static string GatewayKey(string ssid) => $"portal:gateway:{ssid}";
        private static string SitesKey(string tenantId) => $"portal:sites:{tenantId}";

        public PortalCacheService(IMemoryCache cache) => _cache = cache;

        public PortalBrandingResponse? GetBranding(string ssid) =>
            _cache.TryGetValue(BrandingKey(ssid), out PortalBrandingResponse? v) ? v : null;

        public void SetBranding(string ssid, PortalBrandingResponse value) =>
            _cache.Set(BrandingKey(ssid), value, Ttl);

        public void InvalidateBranding(string ssid) =>
            _cache.Remove(BrandingKey(ssid));

        public GatewayConfigResponse? GetGatewayConfig(string ssid) =>
            _cache.TryGetValue(GatewayKey(ssid), out GatewayConfigResponse? v) ? v : null;

        public void SetGatewayConfig(string ssid, GatewayConfigResponse value) =>
            _cache.Set(GatewayKey(ssid), value, Ttl);

        public void InvalidateGatewayConfig(string ssid) =>
            _cache.Remove(GatewayKey(ssid));

        public IEnumerable<PortalSiteResponse>? GetSites(string tenantId) =>
            _cache.TryGetValue(SitesKey(tenantId), out IEnumerable<PortalSiteResponse>? v) ? v : null;

        public void SetSites(string tenantId, IEnumerable<PortalSiteResponse> value) =>
            _cache.Set(SitesKey(tenantId), value, Ttl);

        public void InvalidateSites(string tenantId) =>
            _cache.Remove(SitesKey(tenantId));
    }
}
