namespace AuraConnect.Application.DTOs.Metrics
{
    public class LoginFailureReason
    {
        public string Reason { get; init; } = string.Empty;
        public int Count { get; init; }
    }
}
