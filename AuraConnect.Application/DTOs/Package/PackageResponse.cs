namespace AuraConnect.Application.DTOs.Package
{
    public class PackageResponse
    {
        public string Id { get; init; } = string.Empty;
        public string SiteId { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public string? Description { get; init; }
        public decimal Price { get; init; }
        public string RadiusProfile { get; init; } = string.Empty;
        public string? RadiusRealmId { get; init; }
        public string? RadiusCloudId { get; init; }
        public int? RadiusProfileId { get; init; }
        public bool IsActive { get; init; }
        public int SortOrder { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
    }
}
