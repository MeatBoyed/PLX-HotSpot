using AuraConnect.Application.DTOs.Portal;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Portal
{
    [ApiController]
    [Route("portal/{tenantId}")]
    public class PortalController : ControllerBase
    {
        private readonly IBrandingService _brandingService;
        private readonly ISiteService _siteService;

        public PortalController(IBrandingService brandingService, ISiteService siteService)
        {
            _brandingService = brandingService;
            _siteService = siteService;
        }

        // GET /portal/{tenantId}/sites
        [HttpGet("sites")]
        [ProducesResponseType(typeof(IEnumerable<PortalSiteResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetSites(string tenantId, CancellationToken cancellationToken)
        {
            try
            {
                var sites = await _siteService.GetPortalSitesAsync(tenantId, cancellationToken);
                return Ok(sites);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // GET /portal/{tenantId}/branding?ssid={ssid}
        [HttpGet("branding")]
        [ProducesResponseType(typeof(PortalBrandingResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
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
