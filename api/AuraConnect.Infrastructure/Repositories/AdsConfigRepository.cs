using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Infrastructure.Repositories
{
    public class AdsConfigRepository : IAdsConfigRepository
    {
        private readonly AppDbContext _context;

        public AdsConfigRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AdsConfig?> GetBySiteIdAsync(string siteId, CancellationToken cancellationToken = default)
        {
            return await _context.AdsConfigs
                .FirstOrDefaultAsync(a => a.SiteId == siteId, cancellationToken);
        }

        public async Task AddAsync(AdsConfig adsConfig, CancellationToken cancellationToken = default)
        {
            await _context.AdsConfigs.AddAsync(adsConfig, cancellationToken);
        }

        public Task UpdateAsync(AdsConfig adsConfig, CancellationToken cancellationToken = default)
        {
            _context.Entry(adsConfig).State = EntityState.Modified;
            return Task.CompletedTask;
        }

        public async Task<bool> ExistsAsync(string siteId, CancellationToken cancellationToken = default)
        {
            return await _context.AdsConfigs.AnyAsync(a => a.SiteId == siteId, cancellationToken);
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
