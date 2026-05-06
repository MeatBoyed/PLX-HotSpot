using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.DTOs.Site
{
    /// <summary>
    /// What the client sends when updating a site
    /// </summary>
    public class UpdateSiteRequest
    {
        public string Ssid { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Domain { get; set; }
        public int SortOrder { get; set; }
    }
}
