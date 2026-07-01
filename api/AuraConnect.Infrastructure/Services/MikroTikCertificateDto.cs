using System.Text.Json.Serialization;

namespace AuraConnect.Infrastructure.Services
{
    public class MikroTikCertificateDto
    {
        [JsonPropertyName("name")] public string? Name { get; init; }
        [JsonPropertyName("common-name")] public string? CommonName { get; init; }
        [JsonPropertyName("flags")] public string? Flags { get; init; }
        [JsonPropertyName("invalid-after")] public string? InvalidAfter { get; init; }
        [JsonPropertyName("subject-alt-name")] public string? SubjectAltName { get; init; }
    }
}
