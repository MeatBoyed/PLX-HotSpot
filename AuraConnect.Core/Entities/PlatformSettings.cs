namespace AuraConnect.Core.Entities
{
    public class PlatformSettings
    {
        public const string FixedId = "platform";

        public string Id { get; private set; } = FixedId;
        public string? PayFastMerchantId { get; private set; }
        public string? PayFastMerchantKey { get; private set; }
        public string? PayFastPassPhrase { get; private set; }
        public bool PayFastSandboxMode { get; private set; } = true;
        public string? MikroTikApiHost { get; private set; }
        public string? MikroTikUsername { get; private set; }
        public string? MikroTikPassword { get; private set; }
        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

        private PlatformSettings() { }

        public static PlatformSettings Create() => new() { Id = FixedId };

        public void SetPayFastConfig(string merchantId, string merchantKey, string? passPhrase, bool sandboxMode)
        {
            PayFastMerchantId = merchantId;
            PayFastMerchantKey = merchantKey;
            PayFastPassPhrase = passPhrase;
            PayFastSandboxMode = sandboxMode;
            UpdatedAt = DateTime.UtcNow;
        }

        public bool IsPayFastConfigured => !string.IsNullOrWhiteSpace(PayFastMerchantId) && !string.IsNullOrWhiteSpace(PayFastMerchantKey);

        public void SetMikroTikConfig(string apiHost, string username, string password)
        {
            MikroTikApiHost = apiHost;
            MikroTikUsername = username;
            MikroTikPassword = password;
            UpdatedAt = DateTime.UtcNow;
        }

        public bool IsMikroTikConfigured =>
            !string.IsNullOrWhiteSpace(MikroTikApiHost) &&
            !string.IsNullOrWhiteSpace(MikroTikUsername) &&
            !string.IsNullOrWhiteSpace(MikroTikPassword);
    }
}
