using AuraConnect.Application.DTOs.Metrics;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Portal
{
    [ApiController]
    [Route("portal/usage")]
    [Authorize]
    public class UsageController : ControllerBase
    {
        private readonly IUsageReportingService _usageReportingService;

        public UsageController(IUsageReportingService usageReportingService) => _usageReportingService = usageReportingService;

        private string GetProfileId() =>
            User.FindFirst("profileId")?.Value
                ?? throw new InvalidOperationException("profileId claim missing from token");

        // GET /portal/usage/me?from=&to=
        [HttpGet("me")]
        [ProducesResponseType(typeof(MyUsageResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetMyUsage([FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken)
        {
            var result = await _usageReportingService.GetMyUsageAsync(GetProfileId(), from, to, cancellationToken);
            return Ok(result);
        }
    }
}
