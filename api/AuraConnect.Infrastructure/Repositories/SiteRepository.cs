using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Infrastructure.Repositories
{
    public class SiteRepository : ISiteRepository
    {
        private readonly AppDbContext _context;

        public SiteRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Site?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            return await _context.Sites
                .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        }

        public async Task<Site?> GetBySsidAsync(string ssid, CancellationToken cancellationToken = default)
        {
            return await _context.Sites
                .FirstOrDefaultAsync(s => s.Ssid == ssid, cancellationToken);
        }

        public async Task<IEnumerable<Site>> GetByTenantIdAsync(string tenantId, CancellationToken cancellationToken = default)
        {
            return await _context.Sites
                .Where(s => s.TenantId == tenantId)
                .OrderBy(s => s.SortOrder)
                .ThenBy(s => s.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Site>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Sites
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<Site?> GetSiteWithDetailsAsync(string id, CancellationToken cancellationToken = default)
        {
            return await _context.Sites
                .Include(s => s.Packages.Where(p => p.IsActive))  // Only active packages
                .Include(s => s.Branding)
                .Include(s => s.RadiusConfig)
                .Include(s => s.AdsConfig)
                .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        }

        public async Task<Site?> GetBySsidWithBrandingAsync(string ssid, CancellationToken cancellationToken = default)
        {
            return await _context.Sites
                .AsNoTracking()
                .Include(s => s.Branding)
                .Include(s => s.AdsConfig)
                .FirstOrDefaultAsync(s => s.Ssid == ssid, cancellationToken);
        }

        public async Task<IEnumerable<Site>> GetByTenantIdWithBrandingAsync(string tenantId, CancellationToken cancellationToken = default)
        {
            return await _context.Sites
                .AsNoTracking()
                .Include(s => s.Branding)
                .Where(s => s.TenantId == tenantId)
                .OrderBy(s => s.SortOrder)
                .ThenBy(s => s.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> ExistsAsync(string ssid, CancellationToken cancellationToken = default)
        {
            return await _context.Sites.AnyAsync(s => s.Ssid == ssid, cancellationToken);
        }

        public async Task<bool> ExistsInTenantAsync(string tenantId, string ssid, CancellationToken cancellationToken = default)
        {
            return await _context.Sites.AnyAsync(s => s.TenantId == tenantId && s.Ssid == ssid, cancellationToken);
        }

        public async Task AddAsync(Site site, CancellationToken cancellationToken = default)
        {
            await _context.Sites.AddAsync(site, cancellationToken);
        }

        public Task UpdateAsync(Site site, CancellationToken cancellationToken = default)
        {
            _context.Entry(site).State = EntityState.Modified;
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Site site, CancellationToken cancellationToken = default)
        {
            _context.Sites.Remove(site);
            return Task.CompletedTask;
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
