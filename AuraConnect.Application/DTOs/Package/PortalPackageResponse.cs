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
        public int DurationDays { get; init; }

        // Limit summaries for display
        public bool DataLimitEnabled { get; init; }
        public int? DataAmount { get; init; }
        public string? DataUnit { get; init; }
        public string? DataReset { get; init; }

        public bool TimeLimitEnabled { get; init; }
        public int? TimeAmount { get; init; }
        public string? TimeUnit { get; init; }

        public bool SpeedLimitEnabled { get; init; }
        public int? SpeedDownloadAmount { get; init; }
        public string? SpeedDownloadUnit { get; init; }
        public int? SpeedUploadAmount { get; init; }
        public string? SpeedUploadUnit { get; init; }

        public bool SessionLimitEnabled { get; init; }
        public int? SessionLimit { get; init; }
    }
}
