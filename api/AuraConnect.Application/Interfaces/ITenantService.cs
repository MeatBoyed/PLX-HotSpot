using AuraConnect.Application.DTOs.Tenant;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.Interfaces
{
    /// <summary>
    /// Defines what business operations are available for Tenants
    /// </summary>
    public interface ITenantService
    {
        // Get all tenants (returns DTOs, not Entities)
        Task<IEnumerable<TenantResponse>> GetAllTenantsAsync(CancellationToken cancellationToken = default);

        // Create a new tenant (takes DTO request, returns DTO response)
        Task<TenantResponse> CreateTenantAsync(CreateTenantRequest request, CancellationToken cancellationToken = default);

        // Get tenant by ID
        Task<TenantResponse?> GetTenantByIdAsync(string id, CancellationToken cancellationToken = default);
        
        // Update tenant
        Task<TenantResponse> UpdateTenantAsync(string id, UpdateTenantRequest request, CancellationToken cancellationToken = default);

        // Delete tenant
        Task DeleteTenantAsync(string id, CancellationToken cancellationToken = default);
    }
}
