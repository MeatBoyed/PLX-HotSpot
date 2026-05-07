using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Core.Entities
{
    public class Site : BaseEntity
    {
        // Properties
        public string TenantId { get; private set; } = string.Empty;
        public string Ssid { get; private set; } = string.Empty;
        public string Name { get; private set; } = string.Empty;
        public string? Domain { get; private set; }
        public SiteStatus Status { get; private set; } = SiteStatus.Active;
        public int SortOrder { get; private set; }
        public string[] AuthMethods { get; private set; } = ["free"];
        public bool MarketingOptIn { get; private set; } = false;

        // Navigation
        public virtual Tenant Tenant { get; private set; } = null!;
        public virtual Branding? Branding { get; private set; }
        public virtual AdsConfig? AdsConfig { get; private set; }
        public virtual RadiusConfig? RadiusConfig { get; private set; }
        private readonly List<Package> _packages = new();
        public IReadOnlyCollection<Package> Packages => _packages.AsReadOnly();
        private readonly List<OtpVerification> _otpVerifications = new();
        public IReadOnlyCollection<OtpVerification> OtpVerifications => _otpVerifications.AsReadOnly();
        private readonly List<MarketingSubmission> _marketingSubmissions = new();
        public IReadOnlyCollection<MarketingSubmission> MarketingSubmissions => _marketingSubmissions.AsReadOnly();

        // EF Core constructor
        private Site() { }

        // Domain constructor
        public Site(string tenantId, string ssid, string name, string? domain = null)
        {
            TenantId = tenantId;
            SetSsid(ssid);
            SetName(name);
            if (domain != null) SetDomain(domain);
        }

        // Domain behaviors
        public void SetSsid(string ssid)
        {
            if (string.IsNullOrWhiteSpace(ssid))
                throw new ArgumentException("SSID cannot be empty");
            Ssid = ssid;
            UpdateTimestamp();
        }

        public void SetName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Site name cannot be empty");
            Name = name;
            UpdateTimestamp();
        }

        public void SetDomain(string? domain)
        {
            Domain = domain;
            UpdateTimestamp();
        }

        public void SetStatus(SiteStatus status)
        {
            Status = status;
            UpdateTimestamp();
        }

        public void SetSortOrder(int sortOrder)
        {
            SortOrder = sortOrder;
            UpdateTimestamp();
        }

        public void SetAuthMethods(string[] methods)
        {
            if (methods == null || methods.Length == 0)
                throw new ArgumentException("At least one auth method is required");
            AuthMethods = methods;
            UpdateTimestamp();
        }

        public void SetMarketingOptIn(bool value)
        {
            MarketingOptIn = value;
            UpdateTimestamp();
        }

        public void SetBranding(Branding branding)
        {
            Branding = branding;
            UpdateTimestamp();
        }

        public void AddPackage(Package package)
        {
            _packages.Add(package);
        }
    }
}
