using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuraConnect.Infrastructure.Repositories
{
    public class PlatformSettingsRepository : IPlatformSettingsRepository
    {
        private readonly AppDbContext _context;

        public PlatformSettingsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PlatformSettings?> GetAsync(CancellationToken cancellationToken = default)
            => await _context.PlatformSettings.AsNoTracking().SingleOrDefaultAsync(cancellationToken);

        public async Task UpsertAsync(PlatformSettings settings, CancellationToken cancellationToken = default)
        {
            var exists = await _context.PlatformSettings
                .AnyAsync(p => p.Id == PlatformSettings.FixedId, cancellationToken);

            if (exists)
                _context.PlatformSettings.Update(settings);
            else
                await _context.PlatformSettings.AddAsync(settings, cancellationToken);
        }

        public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
            => await _context.SaveChangesAsync(cancellationToken);
    }
}
