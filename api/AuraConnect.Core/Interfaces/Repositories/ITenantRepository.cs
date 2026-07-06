using AuraConnect.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Core.Interfaces.Repositories
{
    /// <summary>
    /// This is a contract/interface that says:
    /// "Any repository that handles Tenants MUST have these methods"
    /// </summary>
    public interface ITenantRepository
    {
        // Get all tenants from database
        Task<IEnumerable<Tenant>> GetAllAsync(CancellationToken cancellationToken = default);

        // Get a single tenant by its ID
        Task<Tenant?> GetByIdAsync(string id, CancellationToken cancellationToken = default);

        // Check if a tenant with this slug already exists (for uniqueness)
        Task<bool> ExistsAsync(string slug, CancellationToken cancellationToken = default);

        // Add a new tenant to database
        Task AddAsync(Tenant tenant, CancellationToken cancellationToken = default);

        // Save all changes to database
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

        // Update tenant
        Task UpdateAsync(Tenant tenant, CancellationToken cancellationToken = default);

        // Delete tenant
        Task DeleteAsync(Tenant tenant, CancellationToken cancellationToken = default);

    }
}
