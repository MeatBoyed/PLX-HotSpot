namespace AuraConnect.Application.DTOs.Platform
{
    public class UpdatePayFastSettingsRequest
    {
        public string MerchantId { get; init; } = string.Empty;
        public string MerchantKey { get; init; } = string.Empty;
        public string? PassPhrase { get; init; }
        public bool SandboxMode { get; init; } = true;
    }
}
