using System.Text.Json.Serialization;

namespace AuraConnect.Infrastructure.Services
{
    public class MikroTikHotspotServerDto
    {
        [JsonPropertyName("name")] public string? Name { get; init; }
        [JsonPropertyName("interface")] public string? Interface { get; init; }
        [JsonPropertyName("address-pool")] public string? AddressPool { get; init; }
        [JsonPropertyName("profile")] public string? Profile { get; init; }
        [JsonPropertyName("idle-timeout")] public string? IdleTimeout { get; init; }
    }
}
