namespace AuraConnect.Application.DTOs.Auth
{
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool RememberMe { get; set; } = false;

        // Portal site context — provided by the captive portal after it knows which site the user is at
        public string? TenantId { get; set; }
        public string? Ssid { get; set; }
    }
}
