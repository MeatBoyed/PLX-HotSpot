using AuraConnect.Application.DTOs.Admin;
using AuraConnect.Application.DTOs.Gateway;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/gateway-sessions")]
    public class AdminGatewaySessionController : ControllerBase
    {
        private readonly IGatewaySessionService _gatewaySessionService;

        public AdminGatewaySessionController(IGatewaySessionService gatewaySessionService)
        {
            _gatewaySessionService = gatewaySessionService;
        }

        // GET /api/admin/gateway-sessions?page=1&pageSize=20&tenantId=&siteId=&mac=&outcome=&from=&to=
        [HttpGet]
        [ProducesResponseType(typeof(PagedResult<GatewaySessionEventResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSessions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? tenantId = null,
            [FromQuery] string? siteId = null,
            [FromQuery] string? mac = null,
            [FromQuery] GatewayLoginOutcome? outcome = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            CancellationToken cancellationToken = default)
        {
            var result = await _gatewaySessionService.GetSessionsAsync(
                page, pageSize, tenantId, siteId, mac, outcome, from, to, cancellationToken);
            return Ok(result);
        }
    }
}
