namespace AuraConnect.Core.Entities
{
    public class Profile
    {
        public string Id { get; private set; } = string.Empty;
        public string IdentityUserId { get; private set; } = string.Empty;
        public string FirstName { get; private set; } = string.Empty;
        public string LastName { get; private set; } = string.Empty;
        public string? PhoneNumber { get; private set; }
        public string? BlnkIdentityId { get; private set; }
        public string? BlnkWalletId { get; private set; }
        public ProfileStatus Status { get; private set; } = ProfileStatus.Active;
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        public string DisplayName => $"{FirstName} {LastName}";

        private readonly List<SiteMembership> _siteMemberships = new();
        public IReadOnlyCollection<SiteMembership> SiteMemberships => _siteMemberships.AsReadOnly();

        private Profile() { }

        public Profile(string identityUserId, string firstName, string lastName, string? phoneNumber = null)
        {
            Id = Guid.NewGuid().ToString("N");
            IdentityUserId = identityUserId;
            SetFirstName(firstName);
            SetLastName(lastName);
            PhoneNumber = phoneNumber;
            Status = ProfileStatus.Active;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetFirstName(string firstName)
        {
            if (string.IsNullOrWhiteSpace(firstName))
                throw new ArgumentException("First name cannot be empty");
            FirstName = firstName.Trim();
            UpdateTimestamp();
        }

        public void SetLastName(string lastName)
        {
            if (string.IsNullOrWhiteSpace(lastName))
                throw new ArgumentException("Last name cannot be empty");
            LastName = lastName.Trim();
            UpdateTimestamp();
        }

        public void SetPhoneNumber(string? phoneNumber)
        {
            PhoneNumber = phoneNumber;
            UpdateTimestamp();
        }

        public void SetBlnkIdentityId(string? identityId)
        {
            BlnkIdentityId = identityId;
            UpdateTimestamp();
        }

        public void SetBlnkWalletId(string? walletId)
        {
            BlnkWalletId = walletId;
            UpdateTimestamp();
        }

        public void Activate()
        {
            Status = ProfileStatus.Active;
            UpdateTimestamp();
        }

        public void Suspend()
        {
            Status = ProfileStatus.Suspended;
            UpdateTimestamp();
        }

        public void SoftDelete()
        {
            Status = ProfileStatus.Deleted;
            UpdateTimestamp();
        }

        private void UpdateTimestamp() => UpdatedAt = DateTime.UtcNow;
    }
}
