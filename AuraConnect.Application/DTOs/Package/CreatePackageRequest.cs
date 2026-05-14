namespace AuraConnect.Application.DTOs.Package
{
    public class CreatePackageRequest
    {
        public string Name { get; init; } = string.Empty;
        public string? Description { get; init; }
        public decimal Price { get; init; }
        public string RadiusProfile { get; init; } = string.Empty;
        public int? RadiusProfileId { get; init; }
        public int SortOrder { get; init; }
    }
}
