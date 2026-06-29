using AuraConnect.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.DTOs.Tenant
{
    /// <summary>
    /// What the client must send when updating a tenant
    /// </summary>
    public class UpdateTenantRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public PortalRoutingMode PortalRoutingMode { get; set; } = PortalRoutingMode.PerSite;
        public string? SuccessRedirectUrl { get; set; }
    }
}
