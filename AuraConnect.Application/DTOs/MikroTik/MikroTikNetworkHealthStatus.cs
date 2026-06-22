using System.Text.Json.Serialization;

namespace AuraConnect.Application.DTOs.MikroTik
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum MikroTikNetworkHealthStatus
    {
        GatewayUrlNotConfigured,
        ProfileNotFound,
        ServerNotFound,
        IpAddressNotFound,
        PoolNotFound,
        DhcpServerNotFound,
        DhcpServerPoolMismatch,
        DhcpNetworkNotFound,
        DhcpGatewayMismatch,
        NotInFirewallList,
        Healthy
    }
}
