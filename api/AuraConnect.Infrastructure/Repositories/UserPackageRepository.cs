using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuraConnect.Infrastructure.Repositories
{
    public class UserPackageRepository : IUserPackageRepository
    {
        private readonly AppDbContext _context;

        public UserPackageRepository(AppDbContext context) => _context = context;

        public async Task<UserPackage?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
            => await _context.UserPackages.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        public async Task<IEnumerable<UserPackage>> GetByProfileIdAsync(string profileId, CancellationToken cancellationToken = default)
            => await _context.UserPackages.AsNoTracking()
                .Include(u => u.Package)
                .Where(u => u.ProfileId == profileId)
                .OrderByDescending(u => u.PurchasedAt)
                .ToListAsync(cancellationToken);

        public async Task<UserPackage?> GetActiveByProfileAndSiteAsync(string profileId, string siteId, CancellationToken cancellationToken = default)
            => await _context.UserPackages.AsNoTracking()
                .FirstOrDefaultAsync(u => u.ProfileId == profileId && u.SiteId == siteId && u.Status == UserPackageStatus.Active, cancellationToken);

        public async Task<UserPackage?> GetLatestByProfileAndSiteAsync(string profileId, string siteId, CancellationToken cancellationToken = default)
            => await _context.UserPackages
                .Where(u => u.ProfileId == profileId && u.SiteId == siteId
                         && u.RdUsername != null && u.Status != UserPackageStatus.Cancelled)
                .OrderByDescending(u => u.PurchasedAt)
                .FirstOrDefaultAsync(cancellationToken);

        public async Task UpdateAsync(UserPackage userPackage, CancellationToken cancellationToken = default)
        {
            _context.UserPackages.Update(userPackage);
            await Task.CompletedTask;
        }

        public async Task AddAsync(UserPackage userPackage, CancellationToken cancellationToken = default)
            => await _context.UserPackages.AddAsync(userPackage, cancellationToken);

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
            => await _context.SaveChangesAsync(cancellationToken);
    }
}
