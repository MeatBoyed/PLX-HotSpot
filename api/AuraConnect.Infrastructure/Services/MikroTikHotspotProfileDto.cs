using System.Text.Json;
using System.Text.Json.Serialization;

namespace AuraConnect.Infrastructure.Services
{
    public class MikroTikHotspotProfileDto
    {
        [JsonPropertyName("name")] public string? Name { get; init; }
        [JsonPropertyName("dns-name")] public string? DnsName { get; init; }
        [JsonPropertyName("hotspot-address")] public string? HotspotAddress { get; init; }
        [JsonPropertyName("html-directory")] public string? HtmlDirectory { get; init; }
        [JsonPropertyName("html-directory-override")] public string? HtmlDirectoryOverride { get; init; }
        [JsonPropertyName("ssl-certificate")] public string? SslCertificate { get; init; }
        [JsonPropertyName("use-radius")] public JsonElement UseRadius { get; init; }
        [JsonPropertyName("radius-accounting")] public JsonElement RadiusAccounting { get; init; }
        [JsonPropertyName("radius-interim-update")] public string? RadiusInterimUpdate { get; init; }
    }
}
