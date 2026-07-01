using AuraConnect.Application.DTOs.Admin;
using AuraConnect.Application.DTOs.Wallet;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/wallet")]
    public class AdminWalletController : ControllerBase
    {
        private readonly IWalletService _walletService;

        public AdminWalletController(IWalletService walletService) => _walletService = walletService;

        // GET /api/admin/wallet/transactions?page=1&pageSize=20&profileId=&tenantId=&siteId=
        [HttpGet("transactions")]
        [ProducesResponseType(typeof(PagedResult<WalletTransactionResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTransactions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? profileId = null,
            [FromQuery] string? tenantId = null,
            [FromQuery] string? siteId = null,
            CancellationToken cancellationToken = default)
        {
            var result = await _walletService.GetTransactionsPagedAsync(page, pageSize, profileId, tenantId, siteId, cancellationToken);
            return Ok(result);
        }

        [HttpGet("transactions/{transactionId}")]
        [ProducesResponseType(typeof(WalletTransactionResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTransaction(string transactionId, CancellationToken cancellationToken)
        {
            var result = await _walletService.GetTransactionByIdAsync(transactionId, profileId: null, cancellationToken);
            return result is null ? NotFound() : Ok(result);
        }

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

        [HttpGet("profiles/{profileId}/packages")]
        [ProducesResponseType(typeof(IEnumerable<UserPackageResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProfilePackages(string profileId, CancellationToken cancellationToken)
        {
            var result = await _walletService.GetUserPackagesAsync(profileId, cancellationToken);
            return Ok(result);
        }
    }
}
