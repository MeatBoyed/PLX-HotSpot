using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/metrics")]
    public class AdminMetricsController : ControllerBase
    {
        private readonly IUsageReportingService _usageReportingService;

        public AdminMetricsController(IUsageReportingService usageReportingService)
        {
            _usageReportingService = usageReportingService;
        }

        // GET /api/admin/metrics/usage-trend?siteId=&tenantId=&from=&to=&granularity=day
        [HttpGet("usage-trend")]
        public async Task<IActionResult> GetUsageTrend(
            [FromQuery] string? siteId, [FromQuery] string? tenantId,
            [FromQuery] DateTime from, [FromQuery] DateTime to,
            [FromQuery] string granularity, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _usageReportingService.GetUsageTrendAsync(siteId, tenantId, from, to, granularity, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // GET /api/admin/metrics/kpi-summary?siteId=&tenantId=&from=&to=
        [HttpGet("kpi-summary")]
        public async Task<IActionResult> GetKpiSummary(
            [FromQuery] string? siteId, [FromQuery] string? tenantId,
            [FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _usageReportingService.GetKpiSummaryAsync(siteId, tenantId, from, to, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // GET /api/admin/metrics/site-leaderboard?from=&to=&metric=data|sessions
        [HttpGet("site-leaderboard")]
        public async Task<IActionResult> GetSiteLeaderboard(
            [FromQuery] DateTime from, [FromQuery] DateTime to,
            [FromQuery] string metric = "data", CancellationToken cancellationToken = default)
        {
            var result = await _usageReportingService.GetSiteLeaderboardAsync(from, to, metric, cancellationToken);
            return Ok(result);
        }

        // GET /api/admin/metrics/active-sessions?siteId=&tenantId=
        [HttpGet("active-sessions")]
        public async Task<IActionResult> GetActiveSessions(
            [FromQuery] string? siteId, [FromQuery] string? tenantId, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _usageReportingService.GetActiveSessionsSummaryAsync(siteId, tenantId, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // GET /api/admin/metrics/login-health?siteId=&from=&to=
        [HttpGet("login-health")]
        public async Task<IActionResult> GetLoginHealth(
            [FromQuery] string? siteId, [FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken)
        {
            var result = await _usageReportingService.GetLoginHealthAsync(siteId, from, to, cancellationToken);
            return Ok(result);
        }

        // GET /api/admin/metrics/unattributed-stations?from=&to=
        [HttpGet("unattributed-stations")]
        public async Task<IActionResult> GetUnattributedStations(
            [FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken)
        {
            var result = await _usageReportingService.GetUnattributedStationsAsync(from, to, cancellationToken);
            return Ok(result);
        }
    }
}
