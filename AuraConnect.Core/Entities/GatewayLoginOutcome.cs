using System.Text.Json.Serialization;

namespace AuraConnect.Core.Entities
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum GatewayLoginOutcome
    {
        Pending = 0,
        Success = 1,
        Failed = 2,
    }
}
