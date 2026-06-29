namespace AuraConnect.Application.DTOs.Platform
{
    public class PlatformSettingsResponse
    {
        public bool IsPayFastConfigured { get; init; }
        public string? PayFastMerchantId { get; init; }
        public bool IsPayFastMerchantKeySet { get; init; }
        public bool IsPayFastPassPhraseSet { get; init; }
        public bool PayFastSandboxMode { get; init; }

        public bool IsMikroTikConfigured { get; init; }
        public string? MikroTikApiHost { get; init; }
        public string? MikroTikUsername { get; init; }
        public bool IsMikroTikPasswordSet { get; init; }

        public bool IsRadiusDbConfigured { get; init; }
        public string? RadiusDbHost { get; init; }
        public int? RadiusDbPort { get; init; }
        public string? RadiusDbName { get; init; }
        public string? RadiusDbUsername { get; init; }
        public bool IsRadiusDbPasswordSet { get; init; }

        public DateTime? UpdatedAt { get; init; }
    }
}
