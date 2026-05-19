namespace AuraConnect.Application.DTOs.Wallet
{
    public class TopUpResponse
    {
        public string Reference { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        /// <summary>POST target: https://sandbox.payfast.co.za/eng/process or live URL</summary>
        public string PayFastAction { get; set; } = string.Empty;
        /// <summary>Hidden form fields to POST — includes signature as the last field</summary>
        public Dictionary<string, string> PayFastFields { get; set; } = [];
    }
}
