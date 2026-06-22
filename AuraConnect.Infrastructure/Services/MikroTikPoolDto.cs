using System.Text.Json.Serialization;

namespace AuraConnect.Infrastructure.Services
{
    public class MikroTikPoolDto
    {
        [JsonPropertyName("name")] public string? Name { get; init; }
        [JsonPropertyName("ranges")] public string? Ranges { get; init; }
    }
}
