namespace AuraConnect.Application.DTOs.Gateway
{
    public class GatewayLoginRequest
    {
        public string? Mac { get; init; }
        public string? NasId { get; init; }
        public string? LinkLoginOnly { get; init; }
        public string? LinkStatus { get; init; }
        public string? LinkLogout { get; init; }
    }
}
