using AuraConnect.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace AuraConnect.Infrastructure.Services
{
    public class PayFastService : IPayFastService
    {
        private readonly string _merchantId;
        private readonly string _merchantKey;
        private readonly string _passPhrase;
        private readonly bool _sandboxMode;
        private readonly ILogger<PayFastService> _logger;

        public PayFastService(IConfiguration configuration, ILogger<PayFastService> logger)
        {
            _merchantId = configuration["PayFast:MerchantId"] ?? throw new InvalidOperationException("PayFast:MerchantId is not configured");
            _merchantKey = configuration["PayFast:MerchantKey"] ?? throw new InvalidOperationException("PayFast:MerchantKey is not configured");
            _passPhrase = configuration["PayFast:PassPhrase"] ?? string.Empty;
            _sandboxMode = bool.TryParse(configuration["PayFast:SandboxMode"], out var sb) && sb;
            _logger = logger;
        }

        public Task<string> CreatePaymentUrlAsync(decimal amount, string itemName, string reference, string notifyUrl, string returnUrl, string cancelUrl)
        {
            var baseUrl = _sandboxMode
                ? "https://sandbox.payfast.co.za/eng/process"
                : "https://www.payfast.co.za/eng/process";

            var data = new Dictionary<string, string>
            {
                ["merchant_id"] = _merchantId,
                ["merchant_key"] = _merchantKey,
                ["return_url"] = returnUrl,
                ["cancel_url"] = cancelUrl,
                ["notify_url"] = notifyUrl,
                ["m_payment_id"] = reference,
                ["amount"] = amount.ToString("F2"),
                ["item_name"] = itemName,
            };

            var signature = GenerateSignature(data);
            data["signature"] = signature;

            var query = string.Join("&", data.Select(kv => $"{kv.Key}={Uri.EscapeDataString(kv.Value)}"));
            var url = $"{baseUrl}?{query}";

            _logger.LogInformation("Generated PayFast URL for reference {Reference} amount {Amount}", reference, amount);
            return Task.FromResult(url);
        }

        public bool VerifyIpn(Dictionary<string, string> ipnData)
        {
            // Remove signature from data before recalculating
            var data = ipnData
                .Where(kv => kv.Key != "signature")
                .OrderBy(kv => kv.Key)
                .ToDictionary(kv => kv.Key, kv => kv.Value);

            var expected = GenerateSignature(data);

            if (!ipnData.TryGetValue("signature", out var received))
            {
                _logger.LogWarning("PayFast IPN missing signature");
                return false;
            }

            var valid = string.Equals(expected, received, StringComparison.OrdinalIgnoreCase);
            if (!valid)
                _logger.LogWarning("PayFast IPN signature mismatch. Expected {Expected}, got {Received}", expected, received);

            return valid;
        }

        private string GenerateSignature(Dictionary<string, string> data)
        {
            var paramString = string.Join("&", data.Select(kv => $"{kv.Key}={Uri.EscapeDataString(kv.Value)}"));

            if (!string.IsNullOrEmpty(_passPhrase))
                paramString += $"&passphrase={Uri.EscapeDataString(_passPhrase)}";

            return MD5.HashData(Encoding.UTF8.GetBytes(paramString))
                .Aggregate(new StringBuilder(), (sb, b) => sb.AppendFormat("{0:x2}", b), sb => sb.ToString());
        }
    }
}
