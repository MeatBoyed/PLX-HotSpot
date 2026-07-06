namespace AuraConnect.Application.DTOs.Wallet
{
    public class PackageCredentialsResponse
    {
        public string RdUsername { get; init; } = string.Empty;
        public string RdPassword { get; init; } = string.Empty;
        public string? GatewayUrl { get; init; }
    }
}
