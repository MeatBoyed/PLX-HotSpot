using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuraConnect.Infrastructure.Repositories
{
    public class RadiusConfigRepository : IRadiusConfigRepository
    {
        private readonly AppDbContext _context;

        public RadiusConfigRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<RadiusConfig?> GetBySiteIdAsync(string siteId, CancellationToken cancellationToken = default)
        {
            return await _context.RadiusConfigs
                .FirstOrDefaultAsync(r => r.SiteId == siteId, cancellationToken);
        }

        public async Task AddAsync(RadiusConfig config, CancellationToken cancellationToken = default)
        {
            await _context.RadiusConfigs.AddAsync(config, cancellationToken);
        }

        public Task UpdateAsync(RadiusConfig config, CancellationToken cancellationToken = default)
        {
            _context.Entry(config).State = EntityState.Modified;
            return Task.CompletedTask;
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
