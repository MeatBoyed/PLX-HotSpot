namespace AuraConnect.Application.DTOs.Package
{
    public class UpdatePackageRequest
    {
        public string? Name { get; init; }
        public string? Description { get; init; }
        public decimal? Price { get; init; }
        public int? RadiusProfileId { get; init; }  // admin escape hatch — override auto-assigned RD profile ID
        public bool? IsActive { get; init; }
        public int? SortOrder { get; init; }
        public int? DurationDays { get; init; }

        // Data limits
        public bool? DataLimitEnabled { get; init; }
        public int? DataAmount { get; init; }
        public string? DataUnit { get; init; }
        public string? DataReset { get; init; }
        public string? DataCap { get; init; }

        // Time limits
        public bool? TimeLimitEnabled { get; init; }
        public int? TimeAmount { get; init; }
        public string? TimeUnit { get; init; }
        public string? TimeReset { get; init; }
        public string? TimeCap { get; init; }

        // Speed limits
        public bool? SpeedLimitEnabled { get; init; }
        public int? SpeedUploadAmount { get; init; }
        public string? SpeedUploadUnit { get; init; }
        public int? SpeedDownloadAmount { get; init; }
        public string? SpeedDownloadUnit { get; init; }

        // Session limits
        public bool? SessionLimitEnabled { get; init; }
        public int? SessionLimit { get; init; }
    }
}
