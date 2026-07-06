namespace AuraConnect.Application.DTOs.MikroTik
{
    public class MikroTikGatewayStatusResponse
    {
        public string SiteId { get; init; } = string.Empty;
        public string? GatewayUrl { get; init; }
        public MikroTikGatewayHealthStatus Status { get; init; }
        public MikroTikProfileInfo? Profile { get; init; }
        public MikroTikCertificateInfo? Certificate { get; init; }
        public MikroTikServerInfo? Server { get; init; }
        public DateTime CheckedAt { get; init; }
    }
}
