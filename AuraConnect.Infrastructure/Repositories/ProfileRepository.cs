using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuraConnect.Infrastructure.Repositories
{
    public class ProfileRepository : IProfileRepository
    {
        private readonly AppDbContext _context;

        public ProfileRepository(AppDbContext context) => _context = context;

        public async Task<Profile?> GetByIdentityUserIdAsync(string identityUserId, CancellationToken cancellationToken = default) =>
            await _context.Profiles
                .Include(p => p.SiteMemberships)
                .FirstOrDefaultAsync(p => p.IdentityUserId == identityUserId, cancellationToken);

        public async Task<Profile?> GetByIdAsync(string profileId, CancellationToken cancellationToken = default) =>
            await _context.Profiles
                .Include(p => p.SiteMemberships)
                .FirstOrDefaultAsync(p => p.Id == profileId, cancellationToken);

        public async Task<Profile?> GetByIdWithSitesAsync(string profileId, CancellationToken cancellationToken = default) =>
            await _context.Profiles
                .AsNoTracking()
                .Include(p => p.SiteMemberships)
                    .ThenInclude(m => m.Site)
                .FirstOrDefaultAsync(p => p.Id == profileId, cancellationToken);

        public async Task<(List<Profile> Items, int Total)> GetPagedAsync(int page, int pageSize, string? tenantId, string? siteId, CancellationToken cancellationToken = default)
        {
            var query = _context.Profiles
                .AsNoTracking()
                .Include(p => p.SiteMemberships)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(tenantId))
                query = query.Where(p => p.SiteMemberships.Any(m => m.TenantId == tenantId));

            if (!string.IsNullOrWhiteSpace(siteId))
                query = query.Where(p => p.SiteMemberships.Any(m => m.SiteId == siteId));

            var total = await query.CountAsync(cancellationToken);
            var items = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, total);
        }

        public async Task AddAsync(Profile profile, CancellationToken cancellationToken = default) =>
            await _context.Profiles.AddAsync(profile, cancellationToken);

        public Task UpdateAsync(Profile profile, CancellationToken cancellationToken = default)
        {
            _context.Entry(profile).State = EntityState.Modified;
            return Task.CompletedTask;
        }

        public async Task CreditBalanceAsync(string profileId, decimal amount, CancellationToken cancellationToken = default) =>
            await _context.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE profiles SET balance = balance + {amount}, updated_at = NOW() WHERE id = {profileId}",
                cancellationToken);

        public async Task<bool> DebitBalanceAsync(string profileId, decimal amount, CancellationToken cancellationToken = default)
        {
            var rows = await _context.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE profiles SET balance = balance - {amount}, updated_at = NOW() WHERE id = {profileId} AND balance >= {amount}",
                cancellationToken);
            return rows > 0;
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
            await _context.SaveChangesAsync(cancellationToken);
    }
}
