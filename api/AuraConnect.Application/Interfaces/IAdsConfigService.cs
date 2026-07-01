using AuraConnect.Application.DTOs.AdsConfig;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.Interfaces
{
    public interface IAdsConfigService
    {
        Task<AdsConfigResponse?> GetAdsConfigAsync(string siteId, CancellationToken cancellationToken = default);
        Task<AdsConfigResponse> UpdateAdsConfigAsync(string siteId, UpdateAdsConfigRequest request, CancellationToken cancellationToken = default);
    }
}
