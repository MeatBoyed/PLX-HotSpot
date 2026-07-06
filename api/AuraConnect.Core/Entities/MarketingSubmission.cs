using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Core.Entities
{
    public class MarketingSubmission
    {
        public string Id { get; private set; } = Guid.NewGuid().ToString("N");
        public string? SiteId { get; private set; }
        public string Email { get; private set; } = string.Empty;
        public bool Agreed { get; private set; } = true;
        public string? IpAddress { get; private set; }
        public string? UserAgent { get; private set; }
        public string? MacAddress { get; private set; }
        public bool Unsubscribed { get; private set; }
        public DateTime? UnsubscribedAt { get; private set; }
        public DateTime CreatedAt { get; private set; }

        // Navigation
        public virtual Site Site { get; private set; } = null!;

        // Business properties
        public bool IsOptedIn => Agreed && !Unsubscribed;

        // EF Core constructor
        private MarketingSubmission() { }

        // Domain constructor
        public MarketingSubmission(string siteId, string email, string? ipAddress = null, string? userAgent = null, string? macAddress = null)
        {
            Id = Guid.NewGuid().ToString("N");
            SiteId = siteId;
            SetEmail(email);
            IpAddress = ipAddress;
            UserAgent = userAgent;
            MacAddress = macAddress;
            Agreed = true;
            CreatedAt = DateTime.UtcNow;
        }

        // Setters
        public void SetEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email cannot be empty");

            if (!IsValidEmail(email))
                throw new ArgumentException("Invalid email format");

            Email = email.ToLowerInvariant();
        }

        public void Unsubscribe()
        {
            if (Unsubscribed)
                return;

            Unsubscribed = true;
            UnsubscribedAt = DateTime.UtcNow;
        }

        public void Resubscribe()
        {
            Unsubscribed = false;
            UnsubscribedAt = null;
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}
