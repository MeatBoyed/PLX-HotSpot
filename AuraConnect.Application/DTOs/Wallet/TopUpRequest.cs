namespace AuraConnect.Application.DTOs.Wallet
{
    public class TopUpRequest
    {
        public decimal Amount { get; set; }
        public string? ReturnUrl { get; set; }
        public string? CancelUrl { get; set; }
        public string? NotifyUrl { get; set; }
    }
}
