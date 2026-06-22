using AuraConnect.Application.DTOs.Platform;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/platform")]
    public class AdminPlatformController : ControllerBase
    {
        private readonly IPlatformSettingsService _platformSettings;

        public AdminPlatformController(IPlatformSettingsService platformSettings)
        {
            _platformSettings = platformSettings;
        }

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings(CancellationToken cancellationToken)
        {
            var result = await _platformSettings.GetAsync(cancellationToken);
            return Ok(result);
        }

        [HttpPatch("settings/payfast")]
        public async Task<IActionResult> UpdatePayFast([FromBody] UpdatePayFastSettingsRequest request, CancellationToken cancellationToken)
        {
            var result = await _platformSettings.UpdatePayFastAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpPatch("settings/mikrotik")]
        public async Task<IActionResult> UpdateMikroTik([FromBody] UpdateMikroTikSettingsRequest request, CancellationToken cancellationToken)
        {
            var result = await _platformSettings.UpdateMikroTikAsync(request, cancellationToken);
            return Ok(result);
        }
    }
}
