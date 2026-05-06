using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.DTOs.Tenant
{
    /// <summary>
    /// What the client must send when creating a tenant
    /// </summary>
    public class CreateTenantRequest
    {
        public string Name { get; set; } = string.Empty;  // "Joburg Theatre"
        public string Slug { get; set; } = string.Empty;  // "joburg-theatre"
    }
}
