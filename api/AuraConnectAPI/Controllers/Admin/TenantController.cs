using AuraConnect.Application.DTOs.Tenant;
using AuraConnect.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuraConnect.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/tenants")]
    public class TenantController : ControllerBase
    {
        private readonly ITenantService _tenantService;

        public TenantController(ITenantService tenantService)
        {
            _tenantService = tenantService;
        }

        /// <summary>
        /// GET /api/admin/tenants
        /// Returns a list of all tenants
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var tenants = await _tenantService.GetAllTenantsAsync(cancellationToken);
            return Ok(tenants);
        }

        // GET /api/admin/tenants/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id, CancellationToken cancellationToken)
        {
            var tenant = await _tenantService.GetTenantByIdAsync(id, cancellationToken);

            if (tenant == null)
                return NotFound(new { error = $"Tenant with ID '{id}' not found" });

            return Ok(tenant);
        }

        /// <summary>
        /// POST /api/admin/tenants
        /// Creates a new tenant
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTenantRequest request, CancellationToken cancellationToken)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Name is required");

            if (string.IsNullOrWhiteSpace(request.Slug))
                return BadRequest("Slug is required");

            try
            {
                var tenant = await _tenantService.CreateTenantAsync(request, cancellationToken);
                return CreatedAtAction(nameof(GetAll), new { id = tenant.Id }, tenant);  // 201 Created
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });  // 409 Conflict
            }
        }

        // PUT /api/admin/tenants/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateTenantRequest request, CancellationToken cancellationToken)
        {
            // Validation
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { error = "Name is required" });

            if (string.IsNullOrWhiteSpace(request.Slug))
                return BadRequest(new { error = "Slug is required" });

            try
            {
                var tenant = await _tenantService.UpdateTenantAsync(id, request, cancellationToken);
                return Ok(tenant);
            }
            catch (InvalidOperationException ex)
            {
                // Check if it's "not found" vs "conflict" by message content
                if (ex.Message.Contains("not found"))
                    return NotFound(new { error = ex.Message });

                return Conflict(new { error = ex.Message });
            }
        }

        // DELETE /api/admin/tenants/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _tenantService.DeleteTenantAsync(id, cancellationToken);

                // 204 No Content - successful deletion with nothing to return
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message.Contains("not found"))
                    return NotFound(new { error = ex.Message });

                // Business rule violation (has sites)
                return BadRequest(new { error = ex.Message });
            }
        }

    }
}
