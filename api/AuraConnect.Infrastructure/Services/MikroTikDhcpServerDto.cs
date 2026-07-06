using System.Text.Json;
using System.Text.Json.Serialization;

namespace AuraConnect.Infrastructure.Services
{
    public class MikroTikDhcpServerDto
    {
        [JsonPropertyName("name")] public string? Name { get; init; }
        [JsonPropertyName("interface")] public string? Interface { get; init; }
        [JsonPropertyName("address-pool")] public string? AddressPool { get; init; }
        [JsonPropertyName("lease-time")] public string? LeaseTime { get; init; }
        [JsonPropertyName("disabled")] public JsonElement Disabled { get; init; }
    }
}
