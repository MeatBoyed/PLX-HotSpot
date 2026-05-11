namespace AuraConnect.Application.DTOs.Wallet
{
    public class UserPackageResponse
    {
        public string Id { get; set; } = string.Empty;
        public string PackageId { get; set; } = string.Empty;
        public string PackageName { get; set; } = string.Empty;
        public string SiteId { get; set; } = string.Empty;
        public decimal AmountPaid { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime PurchasedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }
}
