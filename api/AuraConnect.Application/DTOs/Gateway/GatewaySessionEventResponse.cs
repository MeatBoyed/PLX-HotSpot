using AuraConnect.Core.Entities;

namespace AuraConnect.Application.DTOs.Gateway
{
    public class GatewaySessionEventResponse
    {
        public string Id { get; init; } = string.Empty;
        public string SiteId { get; init; } = string.Empty;
        public string? Mac { get; init; }
        public string? NasId { get; init; }
        public string ResolvedHost { get; init; } = string.Empty;
        public string RedirectUrl { get; init; } = string.Empty;
        public GatewayLoginOutcome LoginOutcome { get; init; }
        public string? LoginError { get; init; }
        public string? LoginErrorOriginal { get; init; }
        public DateTime? LoginCompletedAt { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
