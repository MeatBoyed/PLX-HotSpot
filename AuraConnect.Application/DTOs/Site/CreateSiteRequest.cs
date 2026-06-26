using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.DTOs.Site
{
    /// <summary>
    /// What the client sends when creating a new site
    /// </summary>
    public class CreateSiteRequest
    {
        public string Ssid { get; set; } = string.Empty;      // "joburg-theatre-main"
        public string Name { get; set; } = string.Empty;       // "Main Auditorium"
        public string? Domain { get; set; }                    // Captive portal domain — required (drives the gateway redirect)
        public int SortOrder { get; set; } = 0;                // Display order
    }
}
