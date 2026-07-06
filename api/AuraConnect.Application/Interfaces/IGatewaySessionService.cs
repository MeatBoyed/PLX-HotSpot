using AuraConnect.Application.DTOs.Admin;
using AuraConnect.Application.DTOs.Gateway;
using AuraConnect.Core.Entities;

namespace AuraConnect.Application.Interfaces
{
    public interface IGatewaySessionService
    {
        Task<string> HandleEntryAsync(GatewayLoginRequest request, CancellationToken cancellationToken = default);

        Task<string?> RecordLoginResultAsync(GatewayLoginResultRequest request, CancellationToken cancellationToken = default);

        Task<PagedResult<GatewaySessionEventResponse>> GetSessionsAsync(
            int page, int pageSize, string? tenantId, string? siteId, string? mac, GatewayLoginOutcome? outcome,
            DateTime? from, DateTime? to, CancellationToken cancellationToken = default);
    }
}
