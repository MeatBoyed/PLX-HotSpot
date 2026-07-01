using AuraConnect.Core.Entities;
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
        public PortalRoutingMode PortalRoutingMode { get; set; } = PortalRoutingMode.PerSite;
        public string? SuccessRedirectUrl { get; set; }  // Default success-login destination for all sites under this tenant; a site's own SuccessRedirectUrl takes precedence
    }
}
