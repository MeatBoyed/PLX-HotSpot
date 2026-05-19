using AuraConnect.Application.DTOs.Portal;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Portal
{
    [ApiController]
    [Route("portal/me")]
    [Authorize]
    public class MeController : ControllerBase
    {
        private readonly IAuthService _authService;

        public MeController(IAuthService authService) => _authService = authService;

        [HttpGet]
        [ProducesResponseType(typeof(MeResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetMe(CancellationToken cancellationToken)
        {
            try
            {
                var result = await _authService.GetMeAsync(User, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        [HttpPatch]
        [ProducesResponseType(typeof(MeResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateMeRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _authService.UpdateMeAsync(User, request, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
