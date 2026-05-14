using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Core.Entities
{
    public class Package
    {
        public string Id { get; private set; } = Guid.NewGuid().ToString("N");
        public string? SiteId { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public decimal Price { get; private set; }

        // RADIUS mapping
        public string RadiusProfile { get; private set; } = string.Empty;
        public int? RadiusProfileId { get; private set; }

        // Status
        public bool IsActive { get; private set; } = true;
        public int SortOrder { get; private set; }

        // Timestamps
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        // Navigation
        public virtual Site Site { get; private set; } = null!;

        // EF Core constructor
        private Package() { }

        // Domain constructor
        public Package(string siteId, string name, string radiusProfile, decimal price = 0)
        {
            Id = Guid.NewGuid().ToString("N");
            SiteId = siteId;
            SetName(name);
            SetRadiusProfile(radiusProfile);
            SetPrice(price);
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        // Setters
        public void SetName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Package name cannot be empty");
            Name = name;
            UpdateTimestamp();
        }

        public void SetDescription(string? description)
        {
            Description = description;
            UpdateTimestamp();
        }

        public void SetPrice(decimal price)
        {
            if (price < 0)
                throw new ArgumentException("Price cannot be negative");
            Price = price;
            UpdateTimestamp();
        }

        public void SetRadiusProfile(string profile)
        {
            if (string.IsNullOrWhiteSpace(profile))
                throw new ArgumentException("RADIUS profile cannot be empty");
            RadiusProfile = profile;
            UpdateTimestamp();
        }

        public void SetRadiusProfileId(int? profileId)
        {
            RadiusProfileId = profileId;
            UpdateTimestamp();
        }

        public void Activate()
        {
            IsActive = true;
            UpdateTimestamp();
        }

        public void Deactivate()
        {
            IsActive = false;
            UpdateTimestamp();
        }

        public void SetSortOrder(int order)
        {
            SortOrder = order;
            UpdateTimestamp();
        }

        public bool IsFree() => Price == 0;

        private void UpdateTimestamp() => UpdatedAt = DateTime.UtcNow;
    }
}
