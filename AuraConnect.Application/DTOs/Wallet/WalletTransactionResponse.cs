namespace AuraConnect.Application.DTOs.Wallet
{
    public class WalletTransactionResponse
    {
        public string Id { get; set; } = string.Empty;
        public string? BlnkTransactionId { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Reference { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
