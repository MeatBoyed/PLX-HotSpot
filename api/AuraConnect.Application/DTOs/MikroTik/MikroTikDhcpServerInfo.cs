namespace AuraConnect.Application.DTOs.MikroTik
{
    public class MikroTikDhcpServerInfo
    {
        public string Name { get; init; } = string.Empty;
        public string? LeaseTime { get; init; }
        public string? AddressPool { get; init; }
        public bool Disabled { get; init; }
        public bool AddressPoolMatchesServer { get; init; }
    }
}
