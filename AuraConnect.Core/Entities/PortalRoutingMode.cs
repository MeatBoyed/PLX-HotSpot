using System.Text.Json.Serialization;

namespace AuraConnect.Core.Entities
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum PortalRoutingMode
    {
        PerSite = 0,
        TenantShared = 1,
    }
}
