namespace AuraConnect.Application.DTOs.Package
{
    public class UpdatePackageRequest
    {
        public string? Name { get; init; }
        public string? Description { get; init; }
        public decimal? Price { get; init; }
        public string? RadiusProfile { get; init; }
        public string? RadiusRealmId { get; init; }
        public string? RadiusCloudId { get; init; }
        public int? RadiusProfileId { get; init; }
        public bool? IsActive { get; init; }
        public int? SortOrder { get; init; }
    }
}
