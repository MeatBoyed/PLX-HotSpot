namespace AuraConnect.Application.DTOs.Metrics
{
    public class LoginHealthResponse
    {
        public int TotalAttempts { get; init; }
        public int SuccessCount { get; init; }
        public int FailureCount { get; init; }
        public IReadOnlyList<LoginFailureReason> FailuresByReason { get; init; } = [];
    }
}
