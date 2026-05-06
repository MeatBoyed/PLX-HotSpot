using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.DTOs.AdsConfig
{
    /// <summary>
    /// Request object for updating ads configuration
    /// All fields are optional - only provided fields will be updated
    /// </summary>
    public class UpdateAdsConfigRequest
    {
        public string? ReviveServerUrl { get; set; }
        public string? ReviveZoneId { get; set; }
        public string? ReviveId { get; set; }
        public string? VastUrl { get; set; }
        public bool? IsEnabled { get; set; }
    }
}
