namespace AuraConnect.Application.DTOs.Package
{
    public class PortalPackageResponse
    {
        public string Id { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public string? Description { get; init; }
        public decimal Price { get; init; }
        public string Currency { get; init; } = "ZAR";
        public bool IsFree { get; init; }
        public int SortOrder { get; init; }
    }
}
