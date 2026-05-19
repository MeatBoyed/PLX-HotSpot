using AuraConnect.Application.DTOs.Platform;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace AuraConnect.Infrastructure.Services
{
    public class PlatformSettingsService : IPlatformSettingsService
    {
        private readonly IPlatformSettingsRepository _repo;
        private readonly ILogger<PlatformSettingsService> _logger;

        public PlatformSettingsService(
            IPlatformSettingsRepository repo,
            ILogger<PlatformSettingsService> logger)
        {
            _repo = repo;
            _logger = logger;
        }

        public async Task<PlatformSettingsResponse> GetAsync(CancellationToken cancellationToken = default)
        {
            var settings = await _repo.GetAsync(cancellationToken);
            return MapToResponse(settings);
        }

        public async Task<PlatformSettingsResponse> UpdatePayFastAsync(UpdatePayFastSettingsRequest request, CancellationToken cancellationToken = default)
        {
            var settings = await _repo.GetAsync(cancellationToken) ?? PlatformSettings.Create();
            settings.SetPayFastConfig(request.MerchantId, request.MerchantKey, request.PassPhrase, request.SandboxMode);

            await _repo.UpsertAsync(settings, cancellationToken);
            await _repo.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("PayFast settings updated — merchantId {MerchantId}, sandbox {SandboxMode}", request.MerchantId, request.SandboxMode);
            return MapToResponse(settings);
        }

        private static PlatformSettingsResponse MapToResponse(PlatformSettings? s) => new()
        {
            IsPayFastConfigured = s?.IsPayFastConfigured ?? false,
            PayFastMerchantId = s?.PayFastMerchantId,
            IsPayFastMerchantKeySet = !string.IsNullOrWhiteSpace(s?.PayFastMerchantKey),
            IsPayFastPassPhraseSet = !string.IsNullOrWhiteSpace(s?.PayFastPassPhrase),
            PayFastSandboxMode = s?.PayFastSandboxMode ?? true,
            UpdatedAt = s?.UpdatedAt
        };
    }
}
