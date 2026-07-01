namespace AuraConnect.Application.DTOs.MikroTik
{
    public class MikroTikServerInfo
    {
        public string Name { get; init; } = string.Empty;
        public string? Interface { get; init; }
        public string? AddressPool { get; init; }
        public string? IdleTimeout { get; init; }
    }
}
