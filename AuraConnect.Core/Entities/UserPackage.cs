namespace AuraConnect.Core.Entities
{
    public class UserPackage
    {
        public string Id { get; private set; }
        public string ProfileId { get; private set; }
        public string PackageId { get; private set; }
        public string SiteId { get; private set; }
        public string BlnkTransactionId { get; private set; }
        public UserPackageStatus Status { get; private set; }
        public DateTime PurchasedAt { get; private set; }
        public DateTime? ExpiresAt { get; private set; }

        public virtual Profile Profile { get; private set; } = null!;
        public virtual Package Package { get; private set; } = null!;
        public virtual Site Site { get; private set; } = null!;

        private UserPackage() { }

        public UserPackage(string profileId, string packageId, string siteId, string blnkTransactionId, DateTime? expiresAt = null)
        {
            Id = Guid.NewGuid().ToString("N");
            ProfileId = profileId;
            PackageId = packageId;
            SiteId = siteId;
            BlnkTransactionId = blnkTransactionId;
            Status = UserPackageStatus.Active;
            PurchasedAt = DateTime.UtcNow;
            ExpiresAt = expiresAt;
        }

        public void Expire() => Status = UserPackageStatus.Expired;
        public void Cancel() => Status = UserPackageStatus.Cancelled;
    }
}
