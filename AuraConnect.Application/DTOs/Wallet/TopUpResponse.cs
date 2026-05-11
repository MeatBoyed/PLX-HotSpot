namespace AuraConnect.Application.DTOs.Wallet
{
    public class TopUpResponse
    {
        public string Reference { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PayFastUrl { get; set; } = string.Empty;
    }
}
