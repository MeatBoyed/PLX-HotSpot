namespace AuraConnect.Application.DTOs.Wallet
{
    public class BlnkTransactionResponse
    {
        public string TransactionId { get; set; } = string.Empty;
        public string Reference { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string Destination { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
