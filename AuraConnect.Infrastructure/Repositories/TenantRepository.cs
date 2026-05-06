using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Infrastructure.Repositories
{
    /// <summary>
    /// Implements the ITenantRepository interface using Entity Framework
    /// This is where actual database queries happen
    /// </summary>
    public class TenantRepository : ITenantRepository
    {
        private readonly AppDbContext _context;

        public TenantRepository(AppDbContext context)
        {
            _context = context;
        }

        // Get all tenants from DB
        public async Task<IEnumerable<Tenant>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Tenants
                .OrderBy(t => t.CreatedAt)  // Oldest first
                .ToListAsync(cancellationToken);
        }

        // Get single tenant by ID
        public async Task<Tenant?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            return await _context.Tenants
                .Include(t => t.Sites)
                .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        }

        // Check if slug exists (for uniqueness)
        public async Task<bool> ExistsAsync(string slug, CancellationToken cancellationToken = default)
        {
            return await _context.Tenants
                .AnyAsync(t => t.Slug == slug, cancellationToken);
        }

        // Add to DbSet (not saved yet)
        public async Task AddAsync(Tenant tenant, CancellationToken cancellationToken = default)
        {
            await _context.Tenants.AddAsync(tenant, cancellationToken);
        }

        // Update method (EF tracks automatically, but explicit method is fine)
        public Task UpdateAsync(Tenant tenant, CancellationToken cancellationToken = default)
        {
            // EF already tracks the entity if retrieved from context
            // This just marks it as modified (useful for disconnected scenarios)
            _context.Entry(tenant).State = EntityState.Modified;
            return Task.CompletedTask;
        }

        // Delete method
        public Task DeleteAsync(Tenant tenant, CancellationToken cancellationToken = default)
        {
            _context.Tenants.Remove(tenant);
            return Task.CompletedTask;
        }

        // Save all pending changes to database
        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }


    }
}
