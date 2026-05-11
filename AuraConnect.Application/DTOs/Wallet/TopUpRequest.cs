namespace AuraConnect.Application.DTOs.Wallet
{
    public class TopUpRequest
    {
        public decimal Amount { get; set; }
        public string ReturnUrl { get; set; } = string.Empty;
        public string CancelUrl { get; set; } = string.Empty;
    }
}
