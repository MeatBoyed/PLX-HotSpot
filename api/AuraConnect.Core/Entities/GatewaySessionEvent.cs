namespace AuraConnect.Core.Entities
{
    public class GatewaySessionEvent : BaseEntity
    {
        public string SiteId { get; private set; } = string.Empty;
        public string? Mac { get; private set; }
        public string? NasId { get; private set; }
        public string? LinkLoginOnly { get; private set; }
        public string? LinkStatus { get; private set; }
        public string? LinkLogout { get; private set; }
        public string ResolvedHost { get; private set; } = string.Empty;
        public string RedirectUrl { get; private set; } = string.Empty;
        public GatewayLoginOutcome LoginOutcome { get; private set; } = GatewayLoginOutcome.Pending;
        public string? LoginError { get; private set; }
        public string? LoginErrorOriginal { get; private set; }
        public DateTime? LoginCompletedAt { get; private set; }

        // Navigation
        public virtual Site Site { get; private set; } = null!;

        // EF Core constructor
        private GatewaySessionEvent() { }

        public GatewaySessionEvent(
            string siteId, string resolvedHost, string redirectUrl,
            string? mac, string? nasId, string? linkLoginOnly, string? linkStatus, string? linkLogout)
        {
            SiteId = siteId;
            ResolvedHost = resolvedHost;
            RedirectUrl = redirectUrl;
            Mac = mac;
            NasId = nasId;
            LinkLoginOnly = linkLoginOnly;
            LinkStatus = linkStatus;
            LinkLogout = linkLogout;
        }

        public void RecordLoginOutcome(GatewayLoginOutcome outcome, string? error, string? errorOriginal)
        {
            LoginOutcome = outcome;
            LoginError = error;
            LoginErrorOriginal = errorOriginal;
            LoginCompletedAt = DateTime.UtcNow;
            UpdateTimestamp();
        }
    }
}
