using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuraConnect.Infrastructure.Repositories
{
    public class PackageRepository : IPackageRepository
    {
        private readonly AppDbContext _context;

        public PackageRepository(AppDbContext context) => _context = context;

        public async Task<Package?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
            => await _context.Packages.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        public async Task<IEnumerable<Package>> GetBySiteIdAsync(string siteId, CancellationToken cancellationToken = default)
            => await _context.Packages.AsNoTracking()
                .Where(p => p.SiteId == siteId && p.IsActive)
                .OrderBy(p => p.SortOrder)
                .ToListAsync(cancellationToken);

        public async Task<IEnumerable<Package>> GetBySiteIdAllAsync(string siteId, CancellationToken cancellationToken = default)
            => await _context.Packages.AsNoTracking()
                .Where(p => p.SiteId == siteId)
                .OrderBy(p => p.SortOrder)
                .ToListAsync(cancellationToken);

        public async Task AddAsync(Package package, CancellationToken cancellationToken = default)
            => await _context.Packages.AddAsync(package, cancellationToken);

        public Task UpdateAsync(Package package, CancellationToken cancellationToken = default)
        {
            _context.Entry(package).State = EntityState.Modified;
            return Task.CompletedTask;
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
            => await _context.SaveChangesAsync(cancellationToken);
    }
}
