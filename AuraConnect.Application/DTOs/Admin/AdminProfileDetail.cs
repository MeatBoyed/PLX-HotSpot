namespace AuraConnect.Application.DTOs.Admin
{
    public class AdminProfileDetail
    {
        public string Id { get; init; } = string.Empty;
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
        public string DisplayName { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string? PhoneNumber { get; init; }
        public string? BlnkIdentityId { get; init; }
        public string? BlnkWalletId { get; init; }
        public string Status { get; init; } = string.Empty;
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
        public IEnumerable<AdminMembershipSummary> Memberships { get; init; } = [];
    }
}
