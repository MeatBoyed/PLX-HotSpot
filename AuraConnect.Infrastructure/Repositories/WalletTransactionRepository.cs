using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuraConnect.Infrastructure.Repositories
{
    public class WalletTransactionRepository : IWalletTransactionRepository
    {
        private readonly AppDbContext _context;

        public WalletTransactionRepository(AppDbContext context) => _context = context;

        public async Task<WalletTransaction?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
            => await _context.WalletTransactions.AsNoTracking().FirstOrDefaultAsync(w => w.Id == id, cancellationToken);

        public async Task<WalletTransaction?> GetByReferenceAsync(string reference, CancellationToken cancellationToken = default)
            => await _context.WalletTransactions.FirstOrDefaultAsync(w => w.Reference == reference, cancellationToken);

        public async Task<IEnumerable<WalletTransaction>> GetByProfileIdAsync(string profileId, CancellationToken cancellationToken = default)
            => await _context.WalletTransactions.AsNoTracking()
                .Where(w => w.ProfileId == profileId)
                .OrderByDescending(w => w.CreatedAt)
                .ToListAsync(cancellationToken);

        public async Task AddAsync(WalletTransaction transaction, CancellationToken cancellationToken = default)
            => await _context.WalletTransactions.AddAsync(transaction, cancellationToken);

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
            => await _context.SaveChangesAsync(cancellationToken);
    }
}
