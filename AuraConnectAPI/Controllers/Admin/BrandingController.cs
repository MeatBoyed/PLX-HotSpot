using AuraConnect.Application.DTOs.Branding;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/sites/{siteId}/branding")]
    public class BrandingController : ControllerBase
    {
        private readonly IBrandingService _brandingService;

        public BrandingController(IBrandingService brandingService)
        {
            _brandingService = brandingService;
        }

        // GET /admin/sites/{siteId}/branding
        [HttpGet]
        public async Task<IActionResult> GetBranding(string siteId, CancellationToken cancellationToken)
        {
            try
            {
                var branding = await _brandingService.GetBrandingAsync(siteId, cancellationToken);

                if (branding == null)
                    return NotFound(new { error = $"No branding configuration found for site '{siteId}'" });

                return Ok(branding);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // PUT /admin/sites/{siteId}/branding
        [HttpPut]
        public async Task<IActionResult> UpdateBranding(string siteId, [FromBody] UpdateBrandingRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var branding = await _brandingService.UpdateBrandingAsync(siteId, request, cancellationToken);
                return Ok(branding);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // PUT /admin/sites/{siteId}/branding/colors
        [HttpPut("colors")]
        public async Task<IActionResult> UpdateColors(string siteId, [FromBody] UpdateColorsRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var branding = await _brandingService.UpdateColorsAsync(siteId, request, cancellationToken);
                return Ok(branding);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // PUT /admin/sites/{siteId}/branding/images
        [HttpPut("images")]
        public async Task<IActionResult> UpdateImages(string siteId, [FromBody] UpdateImagesRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var branding = await _brandingService.UpdateImagesAsync(siteId, request, cancellationToken);
                return Ok(branding);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // PUT /admin/sites/{siteId}/branding/content
        [HttpPut("content")]
        public async Task<IActionResult> UpdateContent(string siteId, [FromBody] UpdateContentRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var branding = await _brandingService.UpdateContentAsync(siteId, request, cancellationToken);
                return Ok(branding);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }
    }
}