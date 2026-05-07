using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Portal
{
    [ApiController]
    [Route("portal/{tenantId}")]
    public class PortalController : ControllerBase
    {
        private readonly IBrandingService _brandingService;

        public PortalController(IBrandingService brandingService)
        {
            _brandingService = brandingService;
        }

        // GET /portal/{tenantId}/branding?ssid={ssid}
        [HttpGet("branding")]
        public async Task<IActionResult> GetBranding(string tenantId, [FromQuery] string ssid, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(ssid))
                return BadRequest(new { error = "ssid query parameter is required" });

            try
            {
                var branding = await _brandingService.GetPortalBrandingAsync(tenantId, ssid, cancellationToken);
                return Ok(branding);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }
    }
}
