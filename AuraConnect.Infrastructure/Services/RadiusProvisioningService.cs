using AuraConnect.Application.Interfaces;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;

namespace AuraConnect.Infrastructure.Services
{
    public class RadiusProvisioningService : IRadiusProvisioningService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<RadiusProvisioningService> _logger;

        private const string DateFormat = "MM/dd/yyyy";

        public RadiusProvisioningService(HttpClient httpClient, ILogger<RadiusProvisioningService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        // ── Profile management ───────────────────────────────────────────────────

        public async Task<RdCreateProfileResult> CreateProfileAsync(RdSiteConfig config, RdProfileRequest request, CancellationToken ct = default)
        {
            var fields = BuildProfileFields(request, config.ApiToken, config.CloudId);
            var json = await PostAsync(config.BaseUrl, "cake4/rd_cake/profiles/simple_add.json", fields, ct);
            if (json == null) return new(false, null, "No response from RadiusDesk");

            if (!IsSuccess(json))
            {
                var err = GetError(json);
                _logger.LogWarning("RD CreateProfile failed: {Error}", err);
                return new(false, null, err);
            }

            // simple_add.json returns {"success":true} with no data.id — look up ID by name
            var profileId = await GetProfileIdByNameAsync(config.BaseUrl, config.ApiToken, config.CloudId, request.Name, ct);
            if (!profileId.HasValue)
                _logger.LogWarning("RD Profile created but ID could not be resolved for name={Name}", request.Name);
            else
                _logger.LogInformation("RD Profile created: id={Id} name={Name}", profileId, request.Name);

            return new(true, profileId, null);
        }

        public async Task<bool> DeleteProfileAsync(RdSiteConfig config, int rdProfileId, CancellationToken ct = default)
        {
            try
            {
                var url = $"{config.BaseUrl.TrimEnd('/')}/cake4/rd_cake/profiles/delete.json?token={Uri.EscapeDataString(config.ApiToken)}";
                if (!string.IsNullOrEmpty(config.CloudId))
                    url += $"&cloud_id={Uri.EscapeDataString(config.CloudId)}";

                _logger.LogDebug("RD DELETE profile id={Id}", rdProfileId);
                var jsonBody = $"[{{\"id\":{rdProfileId}}}]";
                using var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                using var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
                request.Headers.Add("X-Requested-With", "XMLHttpRequest");
                using var response = await _httpClient.SendAsync(request, ct);

                var body = await response.Content.ReadAsStringAsync(ct);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("RD HTTP {Status} for profile delete — body: {Body}", (int)response.StatusCode, body);
                    return false;
                }

                var json = JsonDocument.Parse(body);
                var ok = IsSuccess(json);
                if (ok) _logger.LogInformation("RD Profile deleted: id={Id}", rdProfileId);
                else _logger.LogWarning("RD DeleteProfile failed for id={Id}: {Error}", rdProfileId, GetError(json));
                return ok;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RD delete profile failed for id={Id}", rdProfileId);
                return false;
            }
        }

        public async Task<bool> UpdateProfileAsync(RdSiteConfig config, int rdProfileId, RdProfileRequest request, CancellationToken ct = default)
        {
            var fields = BuildProfileFields(request, config.ApiToken, config.CloudId);
            fields.Add(new("id", rdProfileId.ToString()));
            var json = await PostAsync(config.BaseUrl, "cake4/rd_cake/profiles/simple_edit.json", fields, ct);
            var ok = json != null && IsSuccess(json);
            if (!ok) _logger.LogWarning("RD UpdateProfile failed for id={Id}", rdProfileId);
            return ok;
        }

        // ── Permanent user provisioning ──────────────────────────────────────────

        public async Task<RdProvisionResult> ProvisionUserAsync(RdSiteConfig config, RdProvisionRequest request, CancellationToken ct = default)
        {
            var fields = new List<KeyValuePair<string, string>>
            {
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

            var json = await PostAsync(config.BaseUrl, "cake4/rd_cake/permanent-users/add.json", fields, ct);
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
            // Enable/disable uses a dedicated endpoint with rb=enable/disable
            if (request.Active.HasValue)
            {
                var enableFields = new List<KeyValuePair<string, string>>
                {
                    new("id",    request.RdUserId.ToString()),
                    new("rb",    request.Active.Value ? "enable" : "disable"),
                    new("token", config.ApiToken),
                };
                if (!string.IsNullOrEmpty(config.CloudId))
                    enableFields.Add(new("cloud_id", config.CloudId));

                var json = await PostAsync(config.BaseUrl, "cake4/rd_cake/permanent-users/enable-disable.json", enableFields, ct);
                var ok = json != null && IsSuccess(json);
                if (!ok) _logger.LogWarning("RD {Action} failed for RdUserId={RdUserId}", request.Active.Value ? "Enable" : "Disable", request.RdUserId);
                return ok;
            }

            // Profile/expiry update uses edit-basic-info
            var fields = new List<KeyValuePair<string, string>>
            {
                new("id",       request.RdUserId.ToString()),
                new("realm_id", config.RealmId),
                new("token",    config.ApiToken),
            };

            if (!string.IsNullOrEmpty(config.CloudId))
                fields.Add(new("cloud_id", config.CloudId));
            if (request.ProfileId.HasValue)
                fields.Add(new("profile_id", request.ProfileId.Value.ToString()));
            if (request.ToDate.HasValue)
                fields.Add(new("to_date", request.ToDate.Value.ToString(DateFormat)));

            var editJson = await PostAsync(config.BaseUrl, "cake4/rd_cake/permanent-users/edit-basic-info.json", fields, ct);
            var editOk = editJson != null && IsSuccess(editJson);
            if (!editOk) _logger.LogWarning("RD UpdateUser (edit-basic-info) failed for RdUserId={RdUserId}", request.RdUserId);
            return editOk;
        }

        // ── Helpers ─────────────────────────────────────────────────────────────

        private static List<KeyValuePair<string, string>> BuildProfileFields(RdProfileRequest req, string token, string? cloudId)
        {
            var fields = new List<KeyValuePair<string, string>>
            {
                new("name",  req.Name),
                new("token", token),
                new("data_limit_enabled",    req.DataLimitEnabled    ? "true" : "false"),
                new("time_limit_enabled",    req.TimeLimitEnabled    ? "true" : "false"),
                new("speed_limit_enabled",   req.SpeedLimitEnabled   ? "true" : "false"),
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

        private async Task<int?> GetProfileIdByNameAsync(string baseUrl, string token, string? cloudId, string profileName, CancellationToken ct)
        {
            var url = $"{baseUrl.TrimEnd('/')}/cake4/rd_cake/profiles/index.json?token={Uri.EscapeDataString(token)}&limit=500";
            if (!string.IsNullOrEmpty(cloudId))
                url += $"&cloud_id={Uri.EscapeDataString(cloudId)}";

            var json = await GetAsync(url, token, ct);
            if (json == null) return null;

            if (!json.RootElement.TryGetProperty("data", out var data)) return null;

            foreach (var profile in data.EnumerateArray())
            {
                if (profile.TryGetProperty("name", out var nameProp) &&
                    nameProp.GetString()?.Equals(profileName, StringComparison.OrdinalIgnoreCase) == true &&
                    profile.TryGetProperty("id", out var idProp))
                {
                    return idProp.GetInt32();
                }
            }

            return null;
        }

        private async Task<JsonDocument?> GetAsync(string url, string token, CancellationToken ct)
        {
            try
            {
                _logger.LogDebug("RD GET {Url}", url);
                using var request = new HttpRequestMessage(HttpMethod.Get, url);
                request.Headers.Add("X-Requested-With", "XMLHttpRequest");
                request.Headers.Add("Cookie", $"Token={token}");
                using var response = await _httpClient.SendAsync(request, ct);

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
                _logger.LogError(ex, "RD GET request failed for {Url}", url);
                return null;
            }
        }

        private async Task<JsonDocument?> PostAsync(string baseUrl, string path, List<KeyValuePair<string, string>> fields, CancellationToken ct)
        {
            try
            {
                var token = fields.FirstOrDefault(f => f.Key == "token").Value;
                var url = $"{baseUrl.TrimEnd('/')}/{path}";
                if (!string.IsNullOrEmpty(token))
                    url += $"?token={Uri.EscapeDataString(token)}";

                _logger.LogDebug("RD POST {Url}", url);
                using var content = new FormUrlEncodedContent(fields);
                using var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
                request.Headers.Add("X-Requested-With", "XMLHttpRequest");
                using var response = await _httpClient.SendAsync(request, ct);

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
