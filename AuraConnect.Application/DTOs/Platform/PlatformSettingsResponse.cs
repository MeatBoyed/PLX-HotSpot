namespace AuraConnect.Application.DTOs.Platform
{
    public class PlatformSettingsResponse
    {
        public bool IsPayFastConfigured { get; init; }
        public string? PayFastMerchantId { get; init; }
        public bool IsPayFastMerchantKeySet { get; init; }
        public bool IsPayFastPassPhraseSet { get; init; }
        public bool PayFastSandboxMode { get; init; }

        public DateTime? UpdatedAt { get; init; }
    }
}
