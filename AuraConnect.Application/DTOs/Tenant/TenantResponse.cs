using AuraConnect.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.DTOs.Tenant
{
    /// <summary>
    /// What the API returns when sending tenant data back to client
    /// </summary>
    public class TenantResponse
    {
        public string Id { get; set; } = string.Empty;      // "abc123..."
        public string Name { get; set; } = string.Empty;    // "Joburg Theatre"
        public string Slug { get; set; } = string.Empty;    // "joburg-theatre"
        public PortalRoutingMode PortalRoutingMode { get; set; }
        public DateTime CreatedAt { get; set; }             // When it was created
        public DateTime UpdatedAt { get; set; }             // Last modified
    }
}
