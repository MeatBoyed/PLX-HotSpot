using AuraConnect.Application.DTOs.Admin;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/profiles")]
    public class AdminProfileController : ControllerBase
    {
        private readonly IAdminProfileService _profileService;
        private readonly IWalletService _walletService;

        public AdminProfileController(IAdminProfileService profileService, IWalletService walletService)
        {
            _profileService = profileService;
            _walletService = walletService;
        }

        // GET /api/admin/profiles?page=1&pageSize=20&tenantId=&siteId=
        [HttpGet]
        [ProducesResponseType(typeof(PagedResult<AdminProfileListItem>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProfiles(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? tenantId = null,
            [FromQuery] string? siteId = null,
            CancellationToken cancellationToken = default)
        {
            var result = await _profileService.GetProfilesAsync(page, pageSize, tenantId, siteId, cancellationToken);
            return Ok(result);
        }

        // GET /api/admin/profiles/{profileId}
        [HttpGet("{profileId}")]
        [ProducesResponseType(typeof(AdminProfileDetail), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProfile(string profileId, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _profileService.GetProfileByIdAsync(profileId, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // GET /api/admin/profiles/{profileId}/transactions
        [HttpGet("{profileId}/transactions")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProfileTransactions(string profileId, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _walletService.GetTransactionsAsync(profileId, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // PATCH /api/admin/profiles/{profileId}
        [HttpPatch("{profileId}")]
        [ProducesResponseType(typeof(AdminProfileDetail), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateProfile(string profileId, [FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _profileService.UpdateProfileAsync(profileId, request, cancellationToken);
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

        // PATCH /api/admin/profiles/{profileId}/wallet
        [HttpPatch("{profileId}/wallet")]
        [ProducesResponseType(typeof(AdminProfileDetail), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateWalletIds(string profileId, [FromBody] UpdateWalletIdsRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _profileService.UpdateWalletIdsAsync(profileId, request, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // DELETE /api/admin/profiles/{profileId} — soft delete (sets status=Deleted, locks login)
        [HttpDelete("{profileId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SoftDeleteProfile(string profileId, CancellationToken cancellationToken)
        {
            try
            {
                await _profileService.SoftDeleteProfileAsync(profileId, cancellationToken);
                return NoContent();
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // DELETE /api/admin/profiles/{profileId}/permanent — hard delete (removes all data)
        [HttpDelete("{profileId}/permanent")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> HardDeleteProfile(string profileId, CancellationToken cancellationToken)
        {
            try
            {
                await _profileService.HardDeleteProfileAsync(profileId, cancellationToken);
                return NoContent();
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PATCH /api/admin/profiles/{profileId}/status
        [HttpPatch("{profileId}/status")]
        [ProducesResponseType(typeof(AdminProfileDetail), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SetStatus(string profileId, [FromBody] UpdateProfileStatusRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _profileService.SetStatusAsync(profileId, request.Status, cancellationToken);
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
    }
}
