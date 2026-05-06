using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Application.DTOs.Tenant;
using AuraConnect.Application.Interfaces;
namespace AuraConnect.Application.Services
{
    /// <summary>
    /// Implements the business logic for Tenant operations
    /// </summary>
    public class TenantService : ITenantService
    {
        private readonly ITenantRepository _tenantRepository;

        // Constructor: ASP.NET will inject the repository automatically
        public TenantService(ITenantRepository tenantRepository)
        {
            _tenantRepository = tenantRepository;
        }

        public async Task<IEnumerable<TenantResponse>> GetAllTenantsAsync(CancellationToken cancellationToken = default)
        {
            // 1. Get entities from repository
            var tenants = await _tenantRepository.GetAllAsync(cancellationToken);

            // 2. Convert Entities → DTOs (hand-pick what to return)
            var responses = tenants.Select(tenant => new TenantResponse
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Slug = tenant.Slug,
                CreatedAt = tenant.CreatedAt,
                UpdatedAt = tenant.UpdatedAt
            });

            // 3. Return DTOs
            return responses;

        }

        // POST create new tenant
        public async Task<TenantResponse> CreateTenantAsync(CreateTenantRequest request, CancellationToken cancellationToken = default)
        {
            // 1. BUSINESS RULE: Check if slug is unique
            var slugExists = await _tenantRepository.ExistsAsync(request.Slug, cancellationToken);
            if (slugExists)
            {
                throw new InvalidOperationException($"Tenant with slug '{request.Slug}' already exists");
            }

            // 2. Create new Entity (using domain constructor)
            var tenant = new Tenant(request.Name, request.Slug);

            // 3. Save to database via repository
            await _tenantRepository.AddAsync(tenant, cancellationToken);
            await _tenantRepository.SaveChangesAsync(cancellationToken);

            // 4. Convert to DTO and return
            return new TenantResponse
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Slug = tenant.Slug,
                CreatedAt = tenant.CreatedAt,
                UpdatedAt = tenant.UpdatedAt
            };
        }

        // GET by ID - Retrieve a single tenant
        public async Task<TenantResponse?> GetTenantByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            // 1. Get from database
            var tenant = await _tenantRepository.GetByIdAsync(id, cancellationToken);

            // 2. Return null if not found (controller will handle 404)
            if (tenant == null)
                return null;

            // 3. Convert to DTO and return
            return new TenantResponse
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Slug = tenant.Slug,
                CreatedAt = tenant.CreatedAt,
                UpdatedAt = tenant.UpdatedAt
            };
        }

        // UPDATE - Modify existing tenant
        public async Task<TenantResponse> UpdateTenantAsync(string id, UpdateTenantRequest request, CancellationToken cancellationToken = default)
        {
            // 1. Check if tenant exists
            var tenant = await _tenantRepository.GetByIdAsync(id, cancellationToken);
            if (tenant == null)
                throw new InvalidOperationException($"Tenant with ID '{id}' not found");

            // 2. If slug is changing, check it's unique
            if (tenant.Slug != request.Slug)
            {
                var slugExists = await _tenantRepository.ExistsAsync(request.Slug, cancellationToken);
                if (slugExists)
                    throw new InvalidOperationException($"Tenant with slug '{request.Slug}' already exists");
            }

            // 3. Update the entity (using the domain methods we created earlier)
            tenant.SetName(request.Name);
            tenant.SetSlug(request.Slug);

            // 4. Save changes
            await _tenantRepository.UpdateAsync(tenant, cancellationToken);
            await _tenantRepository.SaveChangesAsync(cancellationToken);

            // 5. Return updated DTO
            return new TenantResponse
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Slug = tenant.Slug,
                CreatedAt = tenant.CreatedAt,
                UpdatedAt = tenant.UpdatedAt
            };
        }

        // DELETE - Remove tenant
        public async Task DeleteTenantAsync(string id, CancellationToken cancellationToken = default)
        {
            // 1. Check if tenant exists
            var tenant = await _tenantRepository.GetByIdAsync(id, cancellationToken);
            if (tenant == null)
                throw new InvalidOperationException($"Tenant with ID '{id}' not found");

            // 2. BUSINESS RULE: Can't delete tenant that has sites
            //    (Eager loaded from GetByIdAsync which includes Sites)
            if (tenant.Sites != null && tenant.Sites.Any())
            {
                throw new InvalidOperationException(
                    $"Cannot delete tenant '{tenant.Name}' because it has {tenant.Sites.Count} site(s). Delete all sites first.");
            }

            // 3. Delete from database
            await _tenantRepository.DeleteAsync(tenant, cancellationToken);
            await _tenantRepository.SaveChangesAsync(cancellationToken);
        }
    }
}
