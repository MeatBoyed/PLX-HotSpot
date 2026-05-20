namespace AuraConnect.Application.DTOs.Package
{
    public class CreatePackageRequest
    {
        public string? Name { get; init; }
        public string? Description { get; init; }
        public decimal Price { get; init; }
        public string? RadiusProfile { get; init; }
        public int? RadiusProfileId { get; init; }  // RD profile ID — obtained from RadiusDesk admin UI
        public int SortOrder { get; init; }
        public int DurationDays { get; init; } = 0;

        // Data limits
        public bool DataLimitEnabled { get; init; }
        public int? DataAmount { get; init; }
        public string? DataUnit { get; init; }   // gb | mb | kb
        public string? DataReset { get; init; }  // daily | weekly | monthly | never
        public string? DataCap { get; init; }    // hard | soft

        // Time limits
        public bool TimeLimitEnabled { get; init; }
        public int? TimeAmount { get; init; }
        public string? TimeUnit { get; init; }   // hour | min
        public string? TimeReset { get; init; }
        public string? TimeCap { get; init; }

        // Speed limits
        public bool SpeedLimitEnabled { get; init; }
        public int? SpeedUploadAmount { get; init; }
        public string? SpeedUploadUnit { get; init; }    // mbps | kbps
        public int? SpeedDownloadAmount { get; init; }
        public string? SpeedDownloadUnit { get; init; }

        // Session limits
        public bool SessionLimitEnabled { get; init; }
        public int? SessionLimit { get; init; }
    }
}
