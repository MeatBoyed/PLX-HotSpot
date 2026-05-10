using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuraConnect.Infrastructure.Repositories
{
    public class SiteMembershipRepository : ISiteMembershipRepository
    {
        private readonly AppDbContext _context;

        public SiteMembershipRepository(AppDbContext context) => _context = context;

        public async Task UpsertAsync(string profileId, string siteId, string tenantId, CancellationToken cancellationToken = default)
        {
            var existing = await _context.SiteMemberships
                .FirstOrDefaultAsync(m => m.ProfileId == profileId && m.SiteId == siteId, cancellationToken);

            if (existing == null)
                await _context.SiteMemberships.AddAsync(new SiteMembership(profileId, siteId, tenantId), cancellationToken);
            else
                existing.RecordVisit();
        }

        public async Task<IEnumerable<string>> GetSiteIdsByProfileAsync(string profileId, CancellationToken cancellationToken = default) =>
            await _context.SiteMemberships
                .Where(m => m.ProfileId == profileId)
                .Select(m => m.SiteId)
                .ToListAsync(cancellationToken);

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
            await _context.SaveChangesAsync(cancellationToken);
    }
}
