using AuraConnect.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Core.Interfaces.Repositories
{
    public interface IAdsConfigRepository
    {
        Task<AdsConfig?> GetBySiteIdAsync(string siteId, CancellationToken cancellationToken = default);
        Task AddAsync(AdsConfig adsConfig, CancellationToken cancellationToken = default);
        Task UpdateAsync(AdsConfig adsConfig, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(string siteId, CancellationToken cancellationToken = default);
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
