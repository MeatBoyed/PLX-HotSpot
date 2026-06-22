namespace AuraConnect.Application.DTOs.Platform
{
    public class UpdateMikroTikSettingsRequest
    {
        public string ApiHost { get; init; } = string.Empty;
        public string Username { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
    }
}
