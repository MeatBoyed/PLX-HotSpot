using System.Text.Json.Serialization;

namespace AuraConnect.Application.DTOs.MikroTik
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum MikroTikGatewayHealthStatus
    {
        GatewayUrlNotConfigured,
        ProfileNotFound,
        ServerNotFound,
        CertificateNotFound,
        CertificateExpired,
        RadiusNotEnabled,
        Healthy
    }
}
