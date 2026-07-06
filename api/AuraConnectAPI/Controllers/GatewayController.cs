using AuraConnect.Application.DTOs.Gateway;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace AuraConnect.API.Controllers
{
    [ApiController]
    [Route("gateway")]
    public class GatewayController : ControllerBase
    {
        private const string FallbackUrl = "https://auraconnect.co.za";

        private readonly IGatewaySessionService _gatewaySessionService;
        private readonly ILogger<GatewayController> _logger;

        public GatewayController(IGatewaySessionService gatewaySessionService, ILogger<GatewayController> logger)
        {
            _gatewaySessionService = gatewaySessionService;
            _logger = logger;
        }

        // POST /gateway/login — MikroTik's login.html auto-submits here on first hotspot hit
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromForm] IFormCollection form, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Gateway login payload: {@Form}", ToDictionary(form));

            var request = new GatewayLoginRequest
            {
                Mac = DecodeMac(form),
                NasId = form["nasid"],
                LinkLoginOnly = form["link_login_only"],
                LinkStatus = form["link_status"],
                LinkLogout = form["link_logout"]
            };

            try
            {
                var redirectUrl = await _gatewaySessionService.HandleEntryAsync(request, cancellationToken);
                _logger.LogInformation("Gateway login responding with {RedirectUrl}", redirectUrl);
                return RedirectHtml(redirectUrl);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Gateway login falling back to {FallbackUrl} — {Reason}", FallbackUrl, ex.Message);
                return RedirectHtml(FallbackUrl);
            }
        }

        // POST /gateway/login-result — MikroTik's alogin.html / error.html auto-submit here after a login attempt
        [HttpPost("login-result")]
        public async Task<IActionResult> LoginResult([FromForm] IFormCollection form, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Gateway login-result payload: {@Form}", ToDictionary(form));

            var request = new GatewayLoginResultRequest
            {
                Mac = DecodeMac(form),
                Result = form["result"],
                Error = form["error"],
                ErrorOriginal = form["error_orig"]
            };

            var redirectUrl = await _gatewaySessionService.RecordLoginResultAsync(request, cancellationToken);
            if (redirectUrl == null)
                _logger.LogWarning("Gateway login-result had no correlated event — falling back to {FallbackUrl}", FallbackUrl);
            else
                _logger.LogInformation("Gateway login-result responding with {RedirectUrl}", redirectUrl);

            return RedirectHtml(redirectUrl ?? FallbackUrl);
        }

        private static Dictionary<string, string> ToDictionary(IFormCollection form) =>
            form.ToDictionary(f => f.Key, f => f.Value.ToString());

        // $(mac-esc) sends the MAC percent-encoded (e.g. "D2%3AA9..." for "D2:A9...") — decode once
        // here so storage/correlation always works against the plain MAC, regardless of how any
        // given template/firmware happens to escape it.
        private static string? DecodeMac(IFormCollection form)
        {
            var raw = form["mac"].ToString();
            return string.IsNullOrEmpty(raw) ? null : Uri.UnescapeDataString(raw);
        }

        // 200 OK + meta-refresh/JS/manual-link, not a bare 3xx — captive-portal mini-browsers
        // are inconsistent about following redirects after a POST, this is belt-and-suspenders.
        private ContentResult RedirectHtml(string url)
        {
            var encoded = WebUtility.HtmlEncode(url);
            var html = $"""
                <html><head><meta http-equiv="refresh" content="0;url={encoded}"></head>
                <body><script>window.location.href="{encoded}";</script>
                <p>Redirecting... <a href="{encoded}">Click here if not redirected</a></p></body></html>
                """;
            return Content(html, "text/html");
        }
    }
}
