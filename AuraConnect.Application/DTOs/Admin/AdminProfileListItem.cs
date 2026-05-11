namespace AuraConnect.Application.DTOs.Admin
{
    public class AdminProfileListItem
    {
        public string Id { get; init; } = string.Empty;
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
        public string DisplayName { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string? PhoneNumber { get; init; }
        public string? BlnkWalletId { get; init; }
        public string Status { get; init; } = string.Empty;
        public DateTime CreatedAt { get; init; }
        public IEnumerable<string> SiteIds { get; init; } = [];
    }
}
