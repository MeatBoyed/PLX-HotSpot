namespace AuraConnect.Application.DTOs.Portal
{
    public class MeResponse
    {
        public string ProfileId { get; init; } = string.Empty;
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
        public string DisplayName { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string? PhoneNumber { get; init; }
        public decimal Balance { get; init; }
        public string Status { get; init; } = string.Empty;
    }
}
