using AuraConnect.Application.DTOs.Admin;

namespace AuraConnect.Application.Interfaces
{
    public interface IAdminProfileService
    {
        Task<PagedResult<AdminProfileListItem>> GetProfilesAsync(int page, int pageSize, string? tenantId, string? siteId, CancellationToken cancellationToken = default);
        Task<AdminProfileDetail> GetProfileByIdAsync(string profileId, CancellationToken cancellationToken = default);
        Task<AdminProfileDetail> UpdateProfileAsync(string profileId, UpdateProfileRequest request, CancellationToken cancellationToken = default);
        Task<AdminProfileDetail> SetStatusAsync(string profileId, string status, CancellationToken cancellationToken = default);
        Task SoftDeleteProfileAsync(string profileId, CancellationToken cancellationToken = default);
        Task HardDeleteProfileAsync(string profileId, CancellationToken cancellationToken = default);
    }
}
