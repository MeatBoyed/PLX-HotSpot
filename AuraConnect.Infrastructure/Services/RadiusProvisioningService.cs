using AuraConnect.Application.Interfaces;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace AuraConnect.Infrastructure.Services
{
    public class RadiusProvisioningService : IRadiusProvisioningService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<RadiusProvisioningService> _logger;

        private static readonly string DateFormat = "MM/dd/yyyy";

        public RadiusProvisioningService(HttpClient httpClient, ILogger<RadiusProvisioningService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<RdCreateProfileResult> CreateProfileAsync(RdSiteConfig config, RdProfileRequest request, CancellationToken ct = default)
        {
            var fields = BuildProfileFields(request, config.ApiToken, config.CloudId);
            var json = await PostAsync(config.BaseUrl, "cake3/rd_cake/profiles/add.json", fields, ct);
            if (json == null) return new(false, null, "No response from RadiusDesk");

            if (!IsSuccess(json))
            {
                var err = GetError(json);
                _logger.LogWarning("RD CreateProfile failed: {Error}", err);
                return new(false, null, err);
            }

            var id = json.RootElement.GetProperty("data").GetProperty("id").GetInt32();
            _logger.LogInformation("RD Profile created: id={Id} name={Name}", id, request.Name);
            return new(true, id, null);
        }

        public async Task<bool> UpdateProfileAsync(RdSiteConfig config, int rdProfileId, RdProfileRequest request, CancellationToken ct = default)
        {
            var fields = BuildProfileFields(request, config.ApiToken, config.CloudId);
            fields.Add(new("id", rdProfileId.ToString()));
            var json = await PostAsync(config.BaseUrl, "cake3/rd_cake/profiles/edit.json", fields, ct);
            var ok = json != null && IsSuccess(json);
            if (!ok) _logger.LogWarning("RD UpdateProfile failed for id={Id}", rdProfileId);
            return ok;
        }

        public async Task<RdProvisionResult> ProvisionUserAsync(RdSiteConfig config, RdProvisionRequest request, CancellationToken ct = default)
        {
            var fields = new List<KeyValuePair<string, string>>
            {
                new("user_id",    "0"),
                new("username",   request.Username),
                new("password",   request.Password),
                new("realm_id",   config.RealmId),
                new("profile_id", request.ProfileId.ToString()),
                new("from_date",  request.FromDate.ToString(DateFormat)),
                new("email",      request.Email ?? string.Empty),
                new("token",      config.ApiToken),
            };

            if (request.ToDate.HasValue)
                fields.Add(new("to_date", request.ToDate.Value.ToString(DateFormat)));
            if (!string.IsNullOrEmpty(request.FirstName))
                fields.Add(new("name", request.FirstName));
            if (!string.IsNullOrEmpty(request.LastName))
                fields.Add(new("surname", request.LastName));
            if (!string.IsNullOrEmpty(config.CloudId))
                fields.Add(new("cloud_id", config.CloudId));

            var json = await PostAsync(config.BaseUrl, "cake3/rd_cake/permanent-users/add.json", fields, ct);
            if (json == null) return new(false, null, null, "No response from RadiusDesk");

            if (!IsSuccess(json))
            {
                var err = GetError(json);
                _logger.LogWarning("RD ProvisionUser failed for {Username}: {Error}", request.Username, err);
                return new(false, null, null, err);
            }

            var data = json.RootElement.GetProperty("data");
            var rdUsername = data.GetProperty("username").GetString();
            var rdUserId = data.GetProperty("id").GetInt32();
            _logger.LogInformation("RD Permanent User created: {RdUsername} id={RdUserId}", rdUsername, rdUserId);
            return new(true, rdUsername, rdUserId, null);
        }

        public async Task<bool> UpdateUserAsync(RdSiteConfig config, RdUpdateUserRequest request, CancellationToken ct = default)
        {
            var fields = new List<KeyValuePair<string, string>>
            {
                new("id",    request.RdUserId.ToString()),
                new("token", config.ApiToken),
            };

            if (!string.IsNullOrEmpty(config.CloudId))
                fields.Add(new("cloud_id", config.CloudId));
            if (request.ProfileId.HasValue)
                fields.Add(new("profile_id", request.ProfileId.Value.ToString()));
            if (request.ToDate.HasValue)
                fields.Add(new("to_date", request.ToDate.Value.ToString(DateFormat)));
            if (request.Active.HasValue)
                fields.Add(new("active", request.Active.Value ? "1" : "0"));

            var json = await PostAsync(config.BaseUrl, "cake3/rd_cake/permanent-users/edit.json", fields, ct);
            var ok = json != null && IsSuccess(json);
            if (!ok) _logger.LogWarning("RD UpdateUser failed for RdUserId={RdUserId}", request.RdUserId);
            return ok;
        }

        // ── Helpers ─────────────────────────────────────────────────────────────

        private static List<KeyValuePair<string, string>> BuildProfileFields(RdProfileRequest req, string token, string? cloudId)
        {
            var fields = new List<KeyValuePair<string, string>>
            {
                new("name",  req.Name),
                new("token", token),
                new("data_limit_enabled",  req.DataLimitEnabled  ? "true" : "false"),
                new("time_limit_enabled",  req.TimeLimitEnabled  ? "true" : "false"),
                new("speed_limit_enabled", req.SpeedLimitEnabled ? "true" : "false"),
                new("session_limit_enabled", req.SessionLimitEnabled ? "true" : "false"),
            };

            if (!string.IsNullOrEmpty(cloudId)) fields.Add(new("cloud_id", cloudId));

            if (req.DataLimitEnabled)
            {
                if (req.DataAmount.HasValue) fields.Add(new("data_amount", req.DataAmount.Value.ToString()));
                if (!string.IsNullOrEmpty(req.DataUnit))  fields.Add(new("data_unit",  req.DataUnit));
                if (!string.IsNullOrEmpty(req.DataReset)) fields.Add(new("data_reset", req.DataReset));
                if (!string.IsNullOrEmpty(req.DataCap))   fields.Add(new("data_cap",   req.DataCap));
            }

            if (req.TimeLimitEnabled)
            {
                if (req.TimeAmount.HasValue) fields.Add(new("time_amount", req.TimeAmount.Value.ToString()));
                if (!string.IsNullOrEmpty(req.TimeUnit))  fields.Add(new("time_unit",  req.TimeUnit));
                if (!string.IsNullOrEmpty(req.TimeReset)) fields.Add(new("time_reset", req.TimeReset));
                if (!string.IsNullOrEmpty(req.TimeCap))   fields.Add(new("time_cap",   req.TimeCap));
            }

            if (req.SpeedLimitEnabled)
            {
                if (req.SpeedUploadAmount.HasValue)   fields.Add(new("speed_upload_amount",   req.SpeedUploadAmount.Value.ToString()));
                if (!string.IsNullOrEmpty(req.SpeedUploadUnit))   fields.Add(new("speed_upload_unit",   req.SpeedUploadUnit));
                if (req.SpeedDownloadAmount.HasValue) fields.Add(new("speed_download_amount", req.SpeedDownloadAmount.Value.ToString()));
                if (!string.IsNullOrEmpty(req.SpeedDownloadUnit)) fields.Add(new("speed_download_unit", req.SpeedDownloadUnit));
            }

            if (req.SessionLimitEnabled && req.SessionLimit.HasValue)
                fields.Add(new("session_limit", req.SessionLimit.Value.ToString()));

            return fields;
        }

        private async Task<JsonDocument?> PostAsync(string baseUrl, string path, List<KeyValuePair<string, string>> fields, CancellationToken ct)
        {
            try
            {
                var url = $"{baseUrl.TrimEnd('/')}/{path}";
                _logger.LogDebug("RD POST {Url}", url);
                using var content = new FormUrlEncodedContent(fields);
                using var response = await _httpClient.PostAsync(url, content, ct);

                var body = await response.Content.ReadAsStringAsync(ct);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("RD HTTP {Status} for {Url} — body: {Body}", (int)response.StatusCode, url, body);
                    return null;
                }

                return JsonDocument.Parse(body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RD request failed for {Path}", path);
                return null;
            }
        }

        private static bool IsSuccess(JsonDocument doc) =>
            doc.RootElement.TryGetProperty("success", out var s) && s.GetBoolean();

        private static string GetError(JsonDocument doc) =>
            doc.RootElement.TryGetProperty("message", out var m) ? (m.GetString() ?? "Unknown error") : "Unknown error";
    }
}
