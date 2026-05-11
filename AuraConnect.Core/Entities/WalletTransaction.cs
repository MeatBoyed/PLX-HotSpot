namespace AuraConnect.Core.Entities
{
    public class WalletTransaction
    {
        public string Id { get; private set; }
        public string ProfileId { get; private set; }
        public string? BlnkTransactionId { get; private set; }
        public WalletTransactionType Type { get; private set; }
        public decimal Amount { get; private set; }
        public string Currency { get; private set; }
        public string Reference { get; private set; }
        public string Status { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public virtual Profile Profile { get; private set; } = null!;

        private WalletTransaction() { }

        public WalletTransaction(string profileId, WalletTransactionType type, decimal amount, string currency, string reference)
        {
            Id = Guid.NewGuid().ToString("N");
            ProfileId = profileId;
            Type = type;
            Amount = amount;
            Currency = currency;
            Reference = reference;
            Status = "Pending";
            CreatedAt = DateTime.UtcNow;
        }

        public void Complete(string blnkTransactionId)
        {
            BlnkTransactionId = blnkTransactionId;
            Status = "Completed";
        }

        public void Fail() => Status = "Failed";
    }
}
