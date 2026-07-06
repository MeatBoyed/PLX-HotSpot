using AuraConnect.Application.DTOs.Portal;
using AuraConnect.Application.DTOs.Radius;

namespace AuraConnect.Application.Interfaces
{
    public interface IRadiusConfigService
    {
        Task<RadiusConfigResponse?> GetRadiusConfigAsync(string siteId, CancellationToken cancellationToken = default);
        Task<RadiusConfigResponse> UpsertRadiusConfigAsync(string siteId, UpdateRadiusConfigRequest request, CancellationToken cancellationToken = default);
        Task<GatewayConfigResponse> GetGatewayConfigAsync(string tenantId, string ssid, CancellationToken cancellationToken = default);
    }
}
