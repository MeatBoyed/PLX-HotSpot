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

        public async Task AddAsync(Profile profile, CancellationToken cancellationToken = default) =>
            await _context.Profiles.AddAsync(profile, cancellationToken);

        public Task UpdateAsync(Profile profile, CancellationToken cancellationToken = default)
        {
            _context.Entry(profile).State = EntityState.Modified;
            return Task.CompletedTask;
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
            await _context.SaveChangesAsync(cancellationToken);
    }
}
