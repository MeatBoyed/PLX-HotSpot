using AuraConnect.Application.DTOs.Platform;

namespace AuraConnect.Application.Interfaces
{
    public interface IPlatformSettingsService
    {
        Task<PlatformSettingsResponse> GetAsync(CancellationToken cancellationToken = default);
        Task<PlatformSettingsResponse> UpdatePayFastAsync(UpdatePayFastSettingsRequest request, CancellationToken cancellationToken = default);
    }
}
