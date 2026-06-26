using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuraConnect.Infrastructure.Repositories
{
    public class GatewaySessionEventRepository : IGatewaySessionEventRepository
    {
        private readonly AppDbContext _context;

        public GatewaySessionEventRepository(AppDbContext context) => _context = context;

        public async Task<GatewaySessionEvent?> FindMostRecentByMacAsync(string mac, TimeSpan window, CancellationToken cancellationToken = default)
        {
            var since = DateTime.UtcNow - window;
            return await _context.GatewaySessionEvents
                .Include(g => g.Site)
                .Where(g => g.Mac == mac && g.CreatedAt >= since)
                .OrderByDescending(g => g.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<(List<GatewaySessionEvent> Items, int Total)> GetPagedAsync(
            int page, int pageSize, string? tenantId, string? siteId, string? mac, GatewayLoginOutcome? outcome,
            DateTime? from, DateTime? to, CancellationToken cancellationToken = default)
        {
            var query = _context.GatewaySessionEvents.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(siteId))
                query = query.Where(g => g.SiteId == siteId);

            if (!string.IsNullOrWhiteSpace(tenantId))
                query = query.Where(g => _context.Sites.Any(s => s.Id == g.SiteId && s.TenantId == tenantId));

            if (!string.IsNullOrWhiteSpace(mac))
                query = query.Where(g => g.Mac == mac);

            if (outcome.HasValue)
                query = query.Where(g => g.LoginOutcome == outcome.Value);

            if (from.HasValue)
                query = query.Where(g => g.CreatedAt >= from.Value);

            if (to.HasValue)
                query = query.Where(g => g.CreatedAt <= to.Value);

            var total = await query.CountAsync(cancellationToken);
            var items = await query
                .OrderByDescending(g => g.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, total);
        }

        public async Task AddAsync(GatewaySessionEvent gatewaySessionEvent, CancellationToken cancellationToken = default)
            => await _context.GatewaySessionEvents.AddAsync(gatewaySessionEvent, cancellationToken);

        public Task UpdateAsync(GatewaySessionEvent gatewaySessionEvent, CancellationToken cancellationToken = default)
        {
            _context.Entry(gatewaySessionEvent).State = EntityState.Modified;
            return Task.CompletedTask;
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
            => await _context.SaveChangesAsync(cancellationToken);
    }
}
