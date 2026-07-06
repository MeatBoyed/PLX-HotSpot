using System.Text.Json.Serialization;

namespace AuraConnect.Infrastructure.Services
{
    public class MikroTikFirewallAddressListDto
    {
        [JsonPropertyName("list")] public string? List { get; init; }
        [JsonPropertyName("address")] public string? Address { get; init; }
        [JsonPropertyName("creation-time")] public string? CreationTime { get; init; }
    }
}
