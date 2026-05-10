namespace AuraConnect.Core.Entities
{
    public class SiteMembership
    {
        public string Id { get; private set; } = string.Empty;
        public string ProfileId { get; private set; } = string.Empty;
        public string SiteId { get; private set; } = string.Empty;
        public string TenantId { get; private set; } = string.Empty;
        public DateTime FirstVisitAt { get; private set; }
        public DateTime LastVisitAt { get; private set; }

        public virtual Profile Profile { get; private set; } = null!;
        public virtual Site Site { get; private set; } = null!;

        private SiteMembership() { }

        public SiteMembership(string profileId, string siteId, string tenantId)
        {
            Id = Guid.NewGuid().ToString("N");
            ProfileId = profileId;
            SiteId = siteId;
            TenantId = tenantId;
            FirstVisitAt = DateTime.UtcNow;
            LastVisitAt = DateTime.UtcNow;
        }

        public void RecordVisit() => LastVisitAt = DateTime.UtcNow;
    }
}
