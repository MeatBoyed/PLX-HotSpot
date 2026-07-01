namespace AuraConnect.Application.DTOs.Auth
{
    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }

        // Portal site context — provided by the captive portal after it knows which site the user is at
        public string? TenantId { get; set; }
        public string? Ssid { get; set; }
    }
}
