using System.Text.Json.Serialization;

namespace AuraConnect.Infrastructure.Services
{
    public class MikroTikIpAddressDto
    {
        [JsonPropertyName("address")] public string? Address { get; init; }
        [JsonPropertyName("network")] public string? Network { get; init; }
        [JsonPropertyName("interface")] public string? Interface { get; init; }
    }
}
