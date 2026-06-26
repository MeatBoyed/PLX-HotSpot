namespace AuraConnect.Application.DTOs.Gateway
{
    public class GatewayLoginResultRequest
    {
        public string? Mac { get; init; }
        public string? Result { get; init; }
        public string? Error { get; init; }
        public string? ErrorOriginal { get; init; }
    }
}
