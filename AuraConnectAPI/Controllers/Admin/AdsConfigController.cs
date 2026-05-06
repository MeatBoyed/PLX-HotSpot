using AuraConnect.Application.DTOs.AdsConfig;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Admin
{

    [ApiController]
    [Route("api/admin/sites/{siteId}/ads")]
    public class AdsConfigController : ControllerBase
    {
        private readonly IAdsConfigService _adsConfigService;

        public AdsConfigController(IAdsConfigService adsConfigService)
        {
            _adsConfigService = adsConfigService;
        }

        /// <summary>
        /// GET /api/admin/sites/{siteId}/ads
        /// Returns the ads configuration for a site
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAdsConfig(string siteId, CancellationToken cancellationToken)
        {
            try
            {
                var adsConfig = await _adsConfigService.GetAdsConfigAsync(siteId, cancellationToken);

                if (adsConfig == null)
                    return NotFound(new { error = $"No ads configuration found for site '{siteId}'" });

                return Ok(adsConfig);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        /// <summary>
        /// PUT /api/admin/sites/{siteId}/ads
        /// Creates or updates the ads configuration for a site
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> UpdateAdsConfig(string siteId, [FromBody] UpdateAdsConfigRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var adsConfig = await _adsConfigService.UpdateAdsConfigAsync(siteId, request, cancellationToken);
                return Ok(adsConfig);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }
    }
}
