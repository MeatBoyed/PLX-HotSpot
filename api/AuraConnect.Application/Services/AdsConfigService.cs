using AuraConnect.Application.DTOs.AdsConfig;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.Services
{
    public class AdsConfigService : IAdsConfigService
    {
        private readonly IAdsConfigRepository _adsConfigRepository;
        private readonly ISiteRepository _siteRepository;

        public AdsConfigService(IAdsConfigRepository adsConfigRepository, ISiteRepository siteRepository)
        {
            _adsConfigRepository = adsConfigRepository;
            _siteRepository = siteRepository;
        }

        // GET ads configuration
        public async Task<AdsConfigResponse?> GetAdsConfigAsync(string siteId, CancellationToken cancellationToken = default)
        {
            // 1. Verify site exists
            var site = await _siteRepository.GetByIdAsync(siteId, cancellationToken);
            if (site == null)
                throw new InvalidOperationException($"Site with ID '{siteId}' not found");

            // 2. Get ads config (or return null if doesn't exist)
            var adsConfig = await _adsConfigRepository.GetBySiteIdAsync(siteId, cancellationToken);

            if (adsConfig == null)
                return null;  // No ads config configured yet

            return MapToResponse(adsConfig);
        }

        // PUT update ads configuration (creates if not exists)
        public async Task<AdsConfigResponse> UpdateAdsConfigAsync(string siteId, UpdateAdsConfigRequest request, CancellationToken cancellationToken = default)
        {
            // 1. Verify site exists
            var site = await _siteRepository.GetByIdAsync(siteId, cancellationToken);
            if (site == null)
                throw new InvalidOperationException($"Site with ID '{siteId}' not found");

            // 2. Get existing or create new ads config
            var adsConfig = await _adsConfigRepository.GetBySiteIdAsync(siteId, cancellationToken);
            var isNew = adsConfig == null;

            if (isNew)
            {
                adsConfig = new AdsConfig(siteId);
            }

            // 3. Apply updates (only non-null values from request)
            if (request.ReviveServerUrl != null)
                adsConfig.SetReviveServerUrl(request.ReviveServerUrl);

            if (request.ReviveZoneId != null)
                adsConfig.SetReviveZoneId(request.ReviveZoneId);

            if (request.ReviveId != null)
                adsConfig.SetReviveId(request.ReviveId);

            if (request.VastUrl != null)
                adsConfig.SetVastUrl(request.VastUrl);

            if (request.IsEnabled.HasValue)
            {
                if (request.IsEnabled.Value)
                    adsConfig.Enable();
                else
                    adsConfig.Disable();
            }

            // 4. Save
            if (isNew)
                await _adsConfigRepository.AddAsync(adsConfig, cancellationToken);
            else
                await _adsConfigRepository.UpdateAsync(adsConfig, cancellationToken);

            await _adsConfigRepository.SaveChangesAsync(cancellationToken);

            return MapToResponse(adsConfig);
        }

        // Helper: Map Entity → DTO
        private static AdsConfigResponse MapToResponse(AdsConfig adsConfig)
        {
            return new AdsConfigResponse
            {
                ReviveServerUrl = adsConfig.ReviveServerUrl,
                ReviveZoneId = adsConfig.ReviveZoneId,
                ReviveId = adsConfig.ReviveId,
                VastUrl = adsConfig.VastUrl,
                IsEnabled = adsConfig.IsEnabled,
                CreatedAt = adsConfig.CreatedAt,
                UpdatedAt = adsConfig.UpdatedAt
            };
        }
    }
}
