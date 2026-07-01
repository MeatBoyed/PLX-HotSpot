using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.DTOs.AdsConfig
{
    /// <summary>
    /// Ads configuration returned to client
    /// </summary>
    public class AdsConfigResponse
    {
        public string? ReviveServerUrl { get; set; }
        public string? ReviveZoneId { get; set; }
        public string? ReviveId { get; set; }
        public string? VastUrl { get; set; }
        public bool IsEnabled { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
