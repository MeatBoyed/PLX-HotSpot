namespace AuraConnect.Application.DTOs.Admin
{
    public class AdminMembershipSummary
    {
        public string SiteId { get; init; } = string.Empty;
        public string SiteName { get; init; } = string.Empty;
        public string TenantId { get; init; } = string.Empty;
        public DateTime FirstVisitAt { get; init; }
        public DateTime LastVisitAt { get; init; }
    }
}
