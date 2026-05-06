using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Infrastructure.Repositories
{

    public class BrandingRepository : IBrandingRepository
    {
        private readonly AppDbContext _context;

        public BrandingRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Branding?> GetBySiteIdAsync(string siteId, CancellationToken cancellationToken = default)
        {
            return await _context.Brandings
                .FirstOrDefaultAsync(b => b.SiteId == siteId, cancellationToken);
        }

        public async Task AddAsync(Branding branding, CancellationToken cancellationToken = default)
        {
            await _context.Brandings.AddAsync(branding, cancellationToken);
        }

        public Task UpdateAsync(Branding branding, CancellationToken cancellationToken = default)
        {
            _context.Entry(branding).State = EntityState.Modified;
            return Task.CompletedTask;
        }

        public async Task<bool> ExistsAsync(string siteId, CancellationToken cancellationToken = default)
        {
            return await _context.Brandings.AnyAsync(b => b.SiteId == siteId, cancellationToken);
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
