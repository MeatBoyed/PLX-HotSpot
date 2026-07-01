using AuraConnect.Application.DTOs.Radius;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/sites/{siteId}/radius")]
    public class RadiusConfigController : ControllerBase
    {
        private readonly IRadiusConfigService _radiusConfigService;

        public RadiusConfigController(IRadiusConfigService radiusConfigService)
        {
            _radiusConfigService = radiusConfigService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(RadiusConfigResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetRadiusConfig(string siteId, CancellationToken cancellationToken)
        {
            try
            {
                var config = await _radiusConfigService.GetRadiusConfigAsync(siteId, cancellationToken);
                if (config == null)
                    return NotFound(new { error = $"No radius configuration found for site '{siteId}'" });
                return Ok(config);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        [HttpPut]
        [ProducesResponseType(typeof(RadiusConfigResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpsertRadiusConfig(string siteId, [FromBody] UpdateRadiusConfigRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var config = await _radiusConfigService.UpsertRadiusConfigAsync(siteId, request, cancellationToken);
                return Ok(config);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }
    }
}
