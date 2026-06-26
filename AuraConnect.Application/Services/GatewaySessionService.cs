using AuraConnect.Application.DTOs.Admin;
using AuraConnect.Application.DTOs.Gateway;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;

namespace AuraConnect.Application.Services
{
    public class GatewaySessionService : IGatewaySessionService
    {
        private static readonly TimeSpan CorrelationWindow = TimeSpan.FromHours(1);

        private readonly IRadiusConfigRepository _radiusConfigRepository;
        private readonly IGatewaySessionEventRepository _gatewaySessionEventRepository;

        public GatewaySessionService(
            IRadiusConfigRepository radiusConfigRepository,
            IGatewaySessionEventRepository gatewaySessionEventRepository)
        {
            _radiusConfigRepository = radiusConfigRepository;
            _gatewaySessionEventRepository = gatewaySessionEventRepository;
        }

        public async Task<string> HandleEntryAsync(GatewayLoginRequest request, CancellationToken cancellationToken = default)
        {
            var host = ExtractHost(request.LinkLoginOnly) ?? ExtractHost(request.LinkStatus) ?? ExtractHost(request.LinkLogout);
            if (host == null)
                throw new InvalidOperationException("Could not determine the gateway host from the request");

            var config = await _radiusConfigRepository.GetByGatewayHostAsync(host, cancellationToken);
            if (config == null)
                throw new InvalidOperationException($"No site found for gateway host '{host}'");

            var site = config.Site;
            if (string.IsNullOrWhiteSpace(site.Domain))
                throw new InvalidOperationException("Site has no portal domain configured");

            var redirectUrl = BuildPortalUrl(site, "splash");

            var gatewaySessionEvent = new GatewaySessionEvent(
                site.Id, host, redirectUrl,
                request.Mac, request.NasId, request.LinkLoginOnly, request.LinkStatus, request.LinkLogout);

            await _gatewaySessionEventRepository.AddAsync(gatewaySessionEvent, cancellationToken);
            await _gatewaySessionEventRepository.SaveChangesAsync(cancellationToken);

            return $"{redirectUrl}?session={gatewaySessionEvent.Id}";
        }

        public async Task<string?> RecordLoginResultAsync(GatewayLoginResultRequest request, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.Mac))
                return null;

            var gatewaySessionEvent = await _gatewaySessionEventRepository.FindMostRecentByMacAsync(request.Mac, CorrelationWindow, cancellationToken);
            if (gatewaySessionEvent == null)
                return null;

            var outcome = string.Equals(request.Result, "success", StringComparison.OrdinalIgnoreCase)
                ? GatewayLoginOutcome.Success
                : GatewayLoginOutcome.Failed;

            gatewaySessionEvent.RecordLoginOutcome(outcome, request.Error, request.ErrorOriginal);

            await _gatewaySessionEventRepository.UpdateAsync(gatewaySessionEvent, cancellationToken);
            await _gatewaySessionEventRepository.SaveChangesAsync(cancellationToken);

            var statusUrl = BuildPortalUrl(gatewaySessionEvent.Site, "splash") + $"?status={(outcome == GatewayLoginOutcome.Success ? "success" : "failed")}";
            if (outcome == GatewayLoginOutcome.Failed && !string.IsNullOrWhiteSpace(request.Error))
                statusUrl += $"&reason={Uri.EscapeDataString(request.Error)}";

            return statusUrl;
        }

        public async Task<PagedResult<GatewaySessionEventResponse>> GetSessionsAsync(
            int page, int pageSize, string? tenantId, string? siteId, string? mac, GatewayLoginOutcome? outcome,
            DateTime? from, DateTime? to, CancellationToken cancellationToken = default)
        {
            var (items, total) = await _gatewaySessionEventRepository.GetPagedAsync(
                page, pageSize, tenantId, siteId, mac, outcome, from, to, cancellationToken);

            return new PagedResult<GatewaySessionEventResponse>
            {
                Items = items.Select(MapToResponse),
                Page = page,
                PageSize = pageSize,
                TotalCount = total
            };
        }

        private static string? ExtractHost(string? url) =>
            Uri.TryCreate(url, UriKind.Absolute, out var uri) ? uri.Host : null;

        private static string BuildPortalUrl(Site site, string path) =>
            $"https://{site.Domain}/{Uri.EscapeDataString(site.Ssid)}/{path}";

        private static GatewaySessionEventResponse MapToResponse(GatewaySessionEvent g) => new()
        {
            Id = g.Id,
            SiteId = g.SiteId,
            Mac = g.Mac,
            NasId = g.NasId,
            ResolvedHost = g.ResolvedHost,
            RedirectUrl = g.RedirectUrl,
            LoginOutcome = g.LoginOutcome.ToString(),
            LoginError = g.LoginError,
            LoginErrorOriginal = g.LoginErrorOriginal,
            LoginCompletedAt = g.LoginCompletedAt,
            CreatedAt = g.CreatedAt
        };
    }
}
