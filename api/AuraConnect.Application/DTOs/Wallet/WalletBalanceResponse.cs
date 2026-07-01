namespace AuraConnect.Application.DTOs.Wallet
{
    public class WalletBalanceResponse
    {
        public string ProfileId { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public decimal AvailableBalance { get; set; }
        public string Currency { get; set; } = string.Empty;
    }
}
