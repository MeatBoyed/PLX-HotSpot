using AuraConnect.Application.DTOs.MikroTik;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/sites/{siteId}/mikrotik")]
    public class AdminMikroTikController : ControllerBase
    {
        private readonly IMikroTikGatewayService _mikroTikGatewayService;

        public AdminMikroTikController(IMikroTikGatewayService mikroTikGatewayService)
        {
            _mikroTikGatewayService = mikroTikGatewayService;
        }

        // GET /api/admin/sites/{siteId}/mikrotik/status
        [HttpGet("status")]
        [ProducesResponseType(typeof(MikroTikGatewayStatusResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public async Task<IActionResult> GetGatewayStatus(string siteId, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _mikroTikGatewayService.GetSiteGatewayStatusAsync(siteId, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                return StatusCode(StatusCodes.Status502BadGateway, new { error = "Could not reach the MikroTik device.", detail = ex.Message });
            }
        }

        // GET /api/admin/sites/{siteId}/mikrotik/network
        [HttpGet("network")]
        [ProducesResponseType(typeof(MikroTikNetworkStatusResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public async Task<IActionResult> GetNetworkStatus(string siteId, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _mikroTikGatewayService.GetSiteNetworkStatusAsync(siteId, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                return StatusCode(StatusCodes.Status502BadGateway, new { error = "Could not reach the MikroTik device.", detail = ex.Message });
            }
        }
    }
}
