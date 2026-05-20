namespace AuraConnect.Application.Interfaces
{
    public record RdSiteConfig(string BaseUrl, string ApiToken, string RealmId, string? CloudId);

    public record RdProfileRequest(
        string Name,
        bool DataLimitEnabled, int? DataAmount, string? DataUnit, string? DataReset, string? DataCap,
        bool TimeLimitEnabled, int? TimeAmount, string? TimeUnit, string? TimeReset, string? TimeCap,
        bool SpeedLimitEnabled, int? SpeedUploadAmount, string? SpeedUploadUnit, int? SpeedDownloadAmount, string? SpeedDownloadUnit,
        bool SessionLimitEnabled, int? SessionLimit
    );

    public record RdCreateProfileResult(bool Success, int? RdProfileId, string? Error);

    public record RdProvisionRequest(
        string Username,
        string Password,
        int ProfileId,
        DateTime FromDate,
        DateTime? ToDate,
        string? FirstName,
        string? LastName,
        string? Email
    );

    public record RdProvisionResult(bool Success, string? RdUsername, int? RdUserId, string? Error);

    public record RdUpdateUserRequest(
        int RdUserId,
        int? ProfileId = null,
        DateTime? ToDate = null,
        bool? Active = null
    );

    public interface IRadiusProvisioningService
    {
        Task<RdCreateProfileResult> CreateProfileAsync(RdSiteConfig config, RdProfileRequest request, CancellationToken ct = default);
        Task<bool> UpdateProfileAsync(RdSiteConfig config, int rdProfileId, RdProfileRequest request, CancellationToken ct = default);
        Task<bool> DeleteProfileAsync(RdSiteConfig config, int rdProfileId, CancellationToken ct = default);
        Task<RdProvisionResult> ProvisionUserAsync(RdSiteConfig config, RdProvisionRequest request, CancellationToken ct = default);
        Task<bool> UpdateUserAsync(RdSiteConfig config, RdUpdateUserRequest request, CancellationToken ct = default);
    }
}
