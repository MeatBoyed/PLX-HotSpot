using AuraConnect.Application.DTOs.MikroTik;

namespace AuraConnect.Application.Interfaces
{
    public interface IMikroTikGatewayService
    {
        Task<MikroTikGatewayStatusResponse> GetSiteGatewayStatusAsync(string siteId, CancellationToken cancellationToken = default);
        Task<MikroTikNetworkStatusResponse> GetSiteNetworkStatusAsync(string siteId, CancellationToken cancellationToken = default);
    }
}
