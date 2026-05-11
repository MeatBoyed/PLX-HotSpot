using AuraConnect.Application.DTOs.Wallet;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Portal
{
    [ApiController]
    [Route("portal/wallet")]
    [Authorize]
    public class WalletController : ControllerBase
    {
        private readonly IWalletService _walletService;

        public WalletController(IWalletService walletService) => _walletService = walletService;

        private string GetProfileId() =>
            User.FindFirst("profileId")?.Value
                ?? throw new InvalidOperationException("profileId claim missing from token");

        [HttpGet("balance")]
        [ProducesResponseType(typeof(WalletBalanceResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetBalance(CancellationToken cancellationToken)
        {
            try
            {
                var result = await _walletService.GetBalanceAsync(GetProfileId(), cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        [HttpGet("transactions")]
        [ProducesResponseType(typeof(IEnumerable<WalletTransactionResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetTransactions(CancellationToken cancellationToken)
        {
            var result = await _walletService.GetTransactionsAsync(GetProfileId(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("packages")]
        [ProducesResponseType(typeof(IEnumerable<UserPackageResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetUserPackages(CancellationToken cancellationToken)
        {
            var result = await _walletService.GetUserPackagesAsync(GetProfileId(), cancellationToken);
            return Ok(result);
        }

        [HttpPost("topup")]
        [ProducesResponseType(typeof(TopUpResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> InitiateTopUp([FromBody] TopUpRequest request, CancellationToken cancellationToken)
        {
            if (request.Amount <= 0)
                return BadRequest(new { error = "Amount must be greater than zero" });

            var notifyUrl = $"{Request.Scheme}://{Request.Host}/portal/wallet/topup/notify";

            try
            {
                var result = await _walletService.InitiateTopUpAsync(
                    GetProfileId(), request.Amount, notifyUrl, request.ReturnUrl, request.CancelUrl, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("topup/notify")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> TopUpNotify([FromForm] IFormCollection form, CancellationToken cancellationToken)
        {
            var ipnData = form.ToDictionary(kv => kv.Key, kv => kv.Value.ToString());

            try
            {
                await _walletService.ProcessTopUpIpnAsync(ipnData, "@PayFast", cancellationToken);
            }
            catch (UnauthorizedAccessException)
            {
                // Return 200 so PayFast doesn't retry, but log already happened in service
            }
            catch (InvalidOperationException)
            {
                // Same — return 200 to stop retries
            }

            return Ok();
        }

        [HttpPost("purchase/{packageId}")]
        [ProducesResponseType(typeof(UserPackageResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> PurchasePackage(string packageId, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _walletService.PurchasePackageAsync(GetProfileId(), packageId, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex) when (ex.Message.StartsWith("Insufficient funds"))
            {
                return StatusCode(StatusCodes.Status402PaymentRequired, new { error = ex.Message });
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
