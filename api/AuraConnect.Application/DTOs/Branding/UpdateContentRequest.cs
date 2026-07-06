using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Application.DTOs.Branding
{
    /// <summary>
    /// Update only text content fields
    /// </summary>
    public class UpdateContentRequest
    {
        public string? DisplayName { get; set; }
        public string? Heading { get; set; }
        public string? Subheading { get; set; }
        public string? SplashHeading { get; set; }
        public string? ButtonText { get; set; }
        public string? TermsLinks { get; set; }
        public string? VenueLabel { get; set; }
        public string? VenueRoute { get; set; }
        public int? SortOrder { get; set; }
    }
}
