using AuraConnect.Application.DTOs.Portal;

namespace AuraConnect.Application.Interfaces
{
    public interface IPortalCacheService
    {
        PortalBrandingResponse? GetBranding(string ssid);
        void SetBranding(string ssid, PortalBrandingResponse value);
        void InvalidateBranding(string ssid);

        GatewayConfigResponse? GetGatewayConfig(string ssid);
        void SetGatewayConfig(string ssid, GatewayConfigResponse value);
        void InvalidateGatewayConfig(string ssid);

        IEnumerable<PortalSiteResponse>? GetSites(string tenantId);
        void SetSites(string tenantId, IEnumerable<PortalSiteResponse> value);
        void InvalidateSites(string tenantId);
    }
}
