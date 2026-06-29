using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Core.Entities
{
    public class Tenant : BaseEntity
    {
        // Properties
        public string Name { get; private set; } = string.Empty;
        public string Slug { get; private set; } = string.Empty;
        public PortalRoutingMode PortalRoutingMode { get; private set; } = PortalRoutingMode.PerSite;
        public string? SuccessRedirectUrl { get; private set; }

        // Navigation
        private readonly List<Site> _sites = new();
        public IReadOnlyCollection<Site> Sites => _sites.AsReadOnly();

        // EF Core constructor
        private Tenant() { }

        // Domain constructor
        public Tenant(string name, string slug)
        {
            SetName(name);
            SetSlug(slug);
        }

        // Domain behaviors
        public void SetName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tenant name cannot be empty");
            Name = name;
            UpdateTimestamp();
        }

        public void SetSlug(string slug)
        {
            if (string.IsNullOrWhiteSpace(slug))
                throw new ArgumentException("Tenant slug cannot be empty");
            Slug = slug.ToLowerInvariant();
            UpdateTimestamp();
        }

        public void AddSite(Site site)
        {
            _sites.Add(site);
        }

        public void SetPortalRoutingMode(PortalRoutingMode mode)
        {
            PortalRoutingMode = mode;
            UpdateTimestamp();
        }

        public void SetSuccessRedirectUrl(string? url)
        {
            if (url != null && !Uri.IsWellFormedUriString(url, UriKind.Absolute))
                throw new ArgumentException("Invalid success redirect URL format");
            SuccessRedirectUrl = url;
            UpdateTimestamp();
        }
    }
}
