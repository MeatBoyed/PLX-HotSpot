using AuraConnect.Application.DTOs.Site;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Admin
{

    [ApiController]
    [Route("api/admin")]
    public class SiteController : ControllerBase
    {
        private readonly ISiteService _siteService;

        public SiteController(ISiteService siteService)
        {
            _siteService = siteService;
        }

        // GET /api/admin/tenants/{tenantId}/sites
        [HttpGet("tenants/{tenantId}/sites")]
        public async Task<IActionResult> GetSitesByTenant(string tenantId, CancellationToken cancellationToken)
        {
            try
            {
                var sites = await _siteService.GetSitesByTenantAsync(tenantId, cancellationToken);
                return Ok(sites);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // POST /api/admin/tenants/{tenantId}/sites
        [HttpPost("tenants/{tenantId}/sites")]
        public async Task<IActionResult> CreateSite(string tenantId, [FromBody] CreateSiteRequest request, CancellationToken cancellationToken)
        {
            // Validation
            if (string.IsNullOrWhiteSpace(request.Ssid))
                return BadRequest(new { error = "SSID is required" });

            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { error = "Name is required" });

            if (string.IsNullOrWhiteSpace(request.Domain))
                return BadRequest(new { error = "Domain is required" });

            try
            {
                var site = await _siteService.CreateSiteAsync(tenantId, request, cancellationToken);

                // Return 201 with location header pointing to GetSiteById
                return CreatedAtAction(nameof(GetSiteById), new { siteId = site.Id }, site);
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message.Contains("not found"))
                    return NotFound(new { error = ex.Message });

                return Conflict(new { error = ex.Message });
            }
        }

        // GET /api/admin/sites/{siteId}
        [HttpGet("sites/{siteId}")]
        public async Task<IActionResult> GetSiteById(string siteId, CancellationToken cancellationToken)
        {
            var site = await _siteService.GetSiteByIdAsync(siteId, cancellationToken);

            if (site == null)
                return NotFound(new { error = $"Site with ID '{siteId}' not found" });

            return Ok(site);
        }

        // PUT /api/admin/sites/{siteId}
        [HttpPut("sites/{siteId}")]
        public async Task<IActionResult> UpdateSite(string siteId, [FromBody] UpdateSiteRequest request, CancellationToken cancellationToken)
        {
            // Validation
            if (string.IsNullOrWhiteSpace(request.Ssid))
                return BadRequest(new { error = "SSID is required" });

            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { error = "Name is required" });

            try
            {
                var site = await _siteService.UpdateSiteAsync(siteId, request, cancellationToken);
                return Ok(site);
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message.Contains("not found"))
                    return NotFound(new { error = ex.Message });

                return Conflict(new { error = ex.Message });
            }
        }

        // DELETE /api/admin/sites/{siteId}
        [HttpDelete("sites/{siteId}")]
        public async Task<IActionResult> DeleteSite(string siteId, CancellationToken cancellationToken)
        {
            try
            {
                await _siteService.DeleteSiteAsync(siteId, cancellationToken);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message.Contains("not found"))
                    return NotFound(new { error = ex.Message });

                // Business rule violation (has packages)
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT /api/admin/sites/{siteId}/status
        [HttpPut("sites/{siteId}/status")]
        public async Task<IActionResult> UpdateSiteStatus(string siteId, [FromBody] UpdateSiteStatusRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var site = await _siteService.UpdateSiteStatusAsync(siteId, request, cancellationToken);
                return Ok(site);
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message.Contains("not found"))
                    return NotFound(new { error = ex.Message });

                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
