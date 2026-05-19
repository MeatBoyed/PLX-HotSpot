using AuraConnect.Application.DTOs.Wallet;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Interfaces.Repositories;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace AuraConnect.Infrastructure.Services
{
    public class PayFastService : IPayFastService
    {
        private readonly IPlatformSettingsRepository _platformSettings;
        private readonly ILogger<PayFastService> _logger;

        public PayFastService(IPlatformSettingsRepository platformSettings, ILogger<PayFastService> logger)
        {
            _platformSettings = platformSettings;
            _logger = logger;
        }

        public async Task<(string Action, Dictionary<string, string> Fields)> CreatePaymentFormAsync(
            decimal amount, string itemName, string reference,
            string? notifyUrl, string? returnUrl, string? cancelUrl,
            CancellationToken cancellationToken = default)
        {
            var settings = await _platformSettings.GetAsync(cancellationToken);
            if (settings == null || !settings.IsPayFastConfigured)
                throw new InvalidOperationException("PayFast is not configured. Set credentials via PATCH /api/admin/platform/settings/payfast.");

            var action = settings.PayFastSandboxMode
                ? "https://sandbox.payfast.co.za/eng/process"
                : "https://www.payfast.co.za/eng/process";

            // Field order must follow PayFast's documented attribute order exactly.
            // URL fields are optional — omit when null/empty (e.g. for local testing without ngrok).
            var fields = new List<KeyValuePair<string, string>>
            {
                new("merchant_id",  settings.PayFastMerchantId!),
                new("merchant_key", settings.PayFastMerchantKey!),
                new("return_url",   returnUrl  ?? string.Empty),
                new("cancel_url",   cancelUrl  ?? string.Empty),
                new("notify_url",   notifyUrl  ?? string.Empty),
                new("m_payment_id", reference),
                new("amount",       amount.ToString("F2")),
                new("item_name",    itemName),
            };

            var signature = GenerateSignature(fields, settings.PayFastPassPhrase);
            fields.Add(new("signature", signature));

            _logger.LogInformation("Generated PayFast form for reference {Reference} amount {Amount}", reference, amount);

            // Return as Dictionary preserving insertion order (.NET 5+ guarantee for Dictionary)
            return (action, fields.ToDictionary(kv => kv.Key, kv => kv.Value));
        }

        public async Task<bool> VerifyIpnAsync(Dictionary<string, string> ipnData, CancellationToken cancellationToken = default)
        {
            var settings = await _platformSettings.GetAsync(cancellationToken);

            // Preserve the order PayFast sent the IPN fields — do not sort
            var data = ipnData
                .Where(kv => kv.Key != "signature")
                .Select(kv => new KeyValuePair<string, string>(kv.Key, kv.Value))
                .ToList();

            var expected = GenerateSignature(data, settings?.PayFastPassPhrase);

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

        // Matches JS: encodeURIComponent(value.trim()).replace(/%20/g, "+")
        // Uri.EscapeDataString produces uppercase hex (%3A not %3a) — PayFast requires uppercase.
        // WebUtility.UrlEncode produces lowercase hex and must NOT be used here.
        private static string Encode(string value) =>
            Uri.EscapeDataString(value.Trim()).Replace("%20", "+");

        // Field order must follow PayFast's documented attribute order (maintained by caller via List<KVP>).
        // Passphrase appended last as a salt before MD5 — blank passphrase is omitted entirely.
        private static string GenerateSignature(IEnumerable<KeyValuePair<string, string>> fields, string? passPhrase)
        {
            var paramString = string.Join("&", fields
                .Where(kv => !string.IsNullOrEmpty(kv.Value))
                .Select(kv => $"{kv.Key}={Encode(kv.Value)}"));

            if (!string.IsNullOrEmpty(passPhrase))
                paramString += $"&passphrase={Encode(passPhrase)}";
            // TEMP DEBUG — remove before shipping
            Console.WriteLine($"[PayFast paramString] {paramString}");


            var signature = MD5.HashData(Encoding.UTF8.GetBytes(paramString))
                .Aggregate(new StringBuilder(), (sb, b) => sb.AppendFormat("{0:x2}", b), sb => sb.ToString());
            Console.WriteLine($"[PayFast Signature] {signature}");


            return signature;
        }
    }
}
