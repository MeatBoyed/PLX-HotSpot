using AuraConnect.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.DTOs.Site
{
    /// <summary>
    /// What the client sends when updating just the status
    /// </summary>
    public class UpdateSiteStatusRequest
    {
        public SiteStatus Status { get; set; }  // Active, Suspended, Maintenance
    }
}
