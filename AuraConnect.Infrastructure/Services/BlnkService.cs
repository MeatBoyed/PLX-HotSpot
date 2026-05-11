using AuraConnect.Application.DTOs.Wallet;
using AuraConnect.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AuraConnect.Infrastructure.Services
{
    public class BlnkService : IBlnkService
    {
        private readonly HttpClient _http;
        private readonly ILogger<BlnkService> _logger;
        private static readonly JsonSerializerOptions _json = new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

        public BlnkService(HttpClient http, ILogger<BlnkService> logger)
        {
            _http = http;
            _logger = logger;
        }

        public async Task<string> CreateIdentityAsync(string firstName, string lastName, string email, CancellationToken cancellationToken = default)
        {
            var body = new { identity_type = "individual", first_name = firstName, last_name = lastName, email_address = email, category = "customer" };
            var response = await _http.PostAsJsonAsync("/identities", body, _json, cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
            var id = result.GetProperty("identity_id").GetString()
                ?? throw new InvalidOperationException("Blnk did not return an identity_id");
            _logger.LogInformation("Created Blnk identity {IdentityId} for {Email}", id, email);
            return id;
        }

        public async Task<string> CreateBalanceAsync(string ledgerId, string identityId, string currency, CancellationToken cancellationToken = default)
        {
            var body = new { ledger_id = ledgerId, identity_id = identityId, currency };
            var response = await _http.PostAsJsonAsync("/balances", body, _json, cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
            var id = result.GetProperty("balance_id").GetString()
                ?? throw new InvalidOperationException("Blnk did not return a balance_id");
            _logger.LogInformation("Created Blnk balance {BalanceId} in ledger {LedgerId}", id, ledgerId);
            return id;
        }

        public async Task<BlnkBalanceResponse> GetBalanceAsync(string balanceId, CancellationToken cancellationToken = default)
        {
            var response = await _http.GetAsync($"/balances/{balanceId}", cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
            return new BlnkBalanceResponse
            {
                BalanceId = result.GetProperty("balance_id").GetString() ?? balanceId,
                LedgerId = result.GetProperty("ledger_id").GetString() ?? string.Empty,
                IdentityId = result.TryGetProperty("identity_id", out var iid) ? iid.GetString() ?? string.Empty : string.Empty,
                Currency = result.GetProperty("currency").GetString() ?? string.Empty,
                Balance = result.GetProperty("balance").GetDecimal(),
                CreditBalance = result.GetProperty("credit_balance").GetDecimal(),
                DebitBalance = result.GetProperty("debit_balance").GetDecimal(),
                InflightCreditBalance = result.TryGetProperty("inflight_credit_balance", out var icb) ? icb.GetDecimal() : 0,
                InflightDebitBalance = result.TryGetProperty("inflight_debit_balance", out var idb) ? idb.GetDecimal() : 0,
            };
        }

        public async Task<string> RecordTransactionAsync(string source, string destination, decimal amount, string reference, string currency, string description, CancellationToken cancellationToken = default)
        {
            // Blnk stores amounts as integers in the smallest unit — multiply by 100 for cents
            var body = new
            {
                amount = (long)(amount * 100),
                reference,
                currency,
                source,
                destination,
                description,
                allow_overdraft = false,
                skip_queue = true
            };

            var response = await _http.PostAsJsonAsync("/transactions", body, _json, cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
            var id = result.GetProperty("transaction_id").GetString()
                ?? throw new InvalidOperationException("Blnk did not return a transaction_id");
            _logger.LogInformation("Recorded Blnk transaction {TransactionId} ref={Reference} amount={Amount} {Currency}", id, reference, amount, currency);
            return id;
        }

        public async Task<IEnumerable<BlnkTransactionResponse>> GetTransactionsByBalanceAsync(string balanceId, CancellationToken cancellationToken = default)
        {
            var response = await _http.GetAsync($"/balances/{balanceId}/transactions", cancellationToken);
            if (!response.IsSuccessStatusCode) return [];

            var result = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
            var list = new List<BlnkTransactionResponse>();

            if (result.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in result.EnumerateArray())
                {
                    list.Add(new BlnkTransactionResponse
                    {
                        TransactionId = item.TryGetProperty("transaction_id", out var tid) ? tid.GetString() ?? string.Empty : string.Empty,
                        Reference = item.TryGetProperty("reference", out var r) ? r.GetString() ?? string.Empty : string.Empty,
                        Amount = item.TryGetProperty("amount", out var a) ? a.GetDecimal() / 100 : 0,
                        Currency = item.TryGetProperty("currency", out var c) ? c.GetString() ?? string.Empty : string.Empty,
                        Source = item.TryGetProperty("source", out var s) ? s.GetString() ?? string.Empty : string.Empty,
                        Destination = item.TryGetProperty("destination", out var d) ? d.GetString() ?? string.Empty : string.Empty,
                        Description = item.TryGetProperty("description", out var desc) ? desc.GetString() ?? string.Empty : string.Empty,
                        Status = item.TryGetProperty("status", out var st) ? st.GetString() ?? string.Empty : string.Empty,
                        CreatedAt = item.TryGetProperty("created_at", out var ca) ? ca.GetDateTime() : DateTime.UtcNow,
                    });
                }
            }

            return list;
        }

        public async Task<string> EnsurePlatformLedgerAsync(CancellationToken cancellationToken = default)
        {
            var body = new { name = "AuraConnect Platform Ledger", meta_data = new { type = "platform" } };
            var response = await _http.PostAsJsonAsync("/ledgers", body, _json, cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
            var id = result.GetProperty("ledger_id").GetString()
                ?? throw new InvalidOperationException("Blnk did not return a ledger_id");
            _logger.LogInformation("Created Blnk platform ledger {LedgerId}", id);
            return id;
        }

        public async Task<string> EnsurePlatformBalanceAsync(string ledgerId, CancellationToken cancellationToken = default)
        {
            var body = new { ledger_id = ledgerId, currency = "ZAR", meta_data = new { type = "platform-holding" } };
            var response = await _http.PostAsJsonAsync("/balances", body, _json, cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
            var id = result.GetProperty("balance_id").GetString()
                ?? throw new InvalidOperationException("Blnk did not return a balance_id");
            _logger.LogInformation("Created Blnk platform holding balance {BalanceId}", id);
            return id;
        }
    }
}
