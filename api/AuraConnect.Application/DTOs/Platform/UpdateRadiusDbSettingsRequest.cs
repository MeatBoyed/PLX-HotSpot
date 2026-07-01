namespace AuraConnect.Application.DTOs.Platform
{
    public class UpdateRadiusDbSettingsRequest
    {
        public string Host { get; init; } = string.Empty;
        public int Port { get; init; } = 3306;
        public string DatabaseName { get; init; } = string.Empty;
        public string Username { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
    }
}
