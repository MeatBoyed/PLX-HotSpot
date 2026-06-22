using AuraConnect.Application.DTOs.Wallet;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/user-packages")]
    public class AdminUserPackageController : ControllerBase
    {
        private readonly IWalletService _walletService;

        public AdminUserPackageController(IWalletService walletService) => _walletService = walletService;

        [HttpGet("{userPackageId}/credentials")]
        [ProducesResponseType(typeof(PackageCredentialsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCredentials(string userPackageId, CancellationToken cancellationToken)
        {
            var result = await _walletService.GetPackageCredentialsAsync(userPackageId, profileId: null, cancellationToken);
            return result is null ? NotFound() : Ok(result);
        }

        [HttpPost("{userPackageId}/disable")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Disable(string userPackageId, CancellationToken cancellationToken)
        {
            try
            {
                await _walletService.SetUserPackageActiveAsync(userPackageId, active: false, cancellationToken);
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

        [HttpPost("{userPackageId}/enable")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Enable(string userPackageId, CancellationToken cancellationToken)
        {
            try
            {
                await _walletService.SetUserPackageActiveAsync(userPackageId, active: true, cancellationToken);
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
    }
}
