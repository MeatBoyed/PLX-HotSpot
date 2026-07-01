namespace AuraConnect.Application.DTOs.MikroTik
{
    public class MikroTikDhcpNetworkInfo
    {
        public string Address { get; init; } = string.Empty;
        public string? Gateway { get; init; }
        public string? DnsServer { get; init; }
        public bool GatewayMatchesAddress { get; init; }
    }
}
