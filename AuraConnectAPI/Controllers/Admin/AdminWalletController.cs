using AuraConnect.Application.DTOs.Wallet;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/wallet")]
    [Authorize(Roles = "Admin")]
    public class AdminWalletController : ControllerBase
    {
        private readonly IWalletService _walletService;

        public AdminWalletController(IWalletService walletService) => _walletService = walletService;

        [HttpGet("profiles/{profileId}")]
        [ProducesResponseType(typeof(WalletBalanceResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProfileWallet(string profileId, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _walletService.GetBalanceAsync(profileId, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        [HttpGet("profiles/{profileId}/transactions")]
        [ProducesResponseType(typeof(IEnumerable<WalletTransactionResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProfileTransactions(string profileId, CancellationToken cancellationToken)
        {
            var result = await _walletService.GetTransactionsAsync(profileId, cancellationToken);
            return Ok(result);
        }

        [HttpGet("profiles/{profileId}/packages")]
        [ProducesResponseType(typeof(IEnumerable<UserPackageResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProfilePackages(string profileId, CancellationToken cancellationToken)
        {
            var result = await _walletService.GetUserPackagesAsync(profileId, cancellationToken);
            return Ok(result);
        }
    }
}
