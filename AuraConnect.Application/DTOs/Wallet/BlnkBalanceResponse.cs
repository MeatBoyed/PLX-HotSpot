namespace AuraConnect.Application.DTOs.Wallet
{
    public class BlnkBalanceResponse
    {
        public string BalanceId { get; set; } = string.Empty;
        public string LedgerId { get; set; } = string.Empty;
        public string IdentityId { get; set; } = string.Empty;
        public string Currency { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public decimal CreditBalance { get; set; }
        public decimal DebitBalance { get; set; }
        public decimal InflightCreditBalance { get; set; }
        public decimal InflightDebitBalance { get; set; }
        public decimal AvailableBalance => Balance - InflightDebitBalance;
    }
}
