using AuraConnect.Application.DTOs.Package;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/sites/{siteId}/packages")]
    public class AdminPackageController : ControllerBase
    {
        private readonly IPackageService _packageService;

        public AdminPackageController(IPackageService packageService) => _packageService = packageService;

        // GET /api/admin/sites/{siteId}/packages
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<PackageResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPackages(string siteId, CancellationToken cancellationToken)
        {
            var result = await _packageService.GetBySiteIdAsync(siteId, cancellationToken);
            return Ok(result);
        }

        // GET /api/admin/sites/{siteId}/packages/{packageId}
        [HttpGet("{packageId}")]
        [ProducesResponseType(typeof(PackageResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPackage(string siteId, string packageId, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _packageService.GetByIdAsync(siteId, packageId, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // POST /api/admin/sites/{siteId}/packages
        [HttpPost]
        [ProducesResponseType(typeof(PackageResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CreatePackage(string siteId, [FromBody] CreatePackageRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { error = "Name is required" });

            try
            {
                var result = await _packageService.CreateAsync(siteId, request, cancellationToken);
                return CreatedAtAction(nameof(GetPackage), new { siteId, packageId = result.Id }, result);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
        }

        // PUT /api/admin/sites/{siteId}/packages/{packageId}
        [HttpPut("{packageId}")]
        [ProducesResponseType(typeof(PackageResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdatePackage(string siteId, string packageId, [FromBody] UpdatePackageRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _packageService.UpdateAsync(siteId, packageId, request, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // DELETE /api/admin/sites/{siteId}/packages/{packageId}
        [HttpDelete("{packageId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeactivatePackage(string siteId, string packageId, CancellationToken cancellationToken)
        {
            try
            {
                await _packageService.DeactivateAsync(siteId, packageId, cancellationToken);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }
    }
}
