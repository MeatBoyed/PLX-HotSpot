using System.Text.Json.Serialization;

namespace AuraConnect.Infrastructure.Services
{
    public class MikroTikDhcpNetworkDto
    {
        [JsonPropertyName("address")] public string? Address { get; init; }
        [JsonPropertyName("gateway")] public string? Gateway { get; init; }
        [JsonPropertyName("dns-server")] public string? DnsServer { get; init; }
    }
}
