namespace AuraConnect.Application.DTOs.MikroTik
{
    public class MikroTikNetworkStatusResponse
    {
        public string SiteId { get; init; } = string.Empty;
        public MikroTikNetworkHealthStatus Status { get; init; }
        public string? Interface { get; init; }
        public MikroTikIpAddressInfo? IpAddress { get; init; }
        public MikroTikPoolInfo? Pool { get; init; }
        public MikroTikDhcpServerInfo? DhcpServer { get; init; }
        public MikroTikDhcpNetworkInfo? DhcpNetwork { get; init; }
        public MikroTikFirewallInfo? Firewall { get; init; }
        public DateTime CheckedAt { get; init; }
    }
}
