using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Core.Entities
{
    public class RadiusConfig
    {
        public string? SiteId { get; private set; }
        public string Host { get; private set; } = string.Empty;
        public int Port { get; private set; } = 1812;
        public string Secret { get; private set; } = string.Empty;
        public string? NasIdentifier { get; private set; }
        public string? Realm { get; private set; }
        public int? AcctPort { get; private set; } = 1813;
        public int? TimeoutMs { get; private set; } = 5000;
        public int? Retries { get; private set; } = 3;
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        // Navigation
        public virtual Site Site { get; private set; } = null!;

        // EF Core constructor
        private RadiusConfig() { }

        // Domain constructor
        public RadiusConfig(string siteId, string host, string secret, int port = 1812)
        {
            SiteId = siteId;
            SetHost(host);
            SetSecret(secret);
            SetPort(port);
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        // Setters
        public void SetHost(string host)
        {
            if (string.IsNullOrWhiteSpace(host))
                throw new ArgumentException("RADIUS host cannot be empty");
            Host = host;
            UpdateTimestamp();
        }

        public void SetPort(int port)
        {
            if (port < 1 || port > 65535)
                throw new ArgumentException("Port must be between 1 and 65535");
            Port = port;
            UpdateTimestamp();
        }

        public void SetSecret(string secret)
        {
            if (string.IsNullOrWhiteSpace(secret))
                throw new ArgumentException("RADIUS secret cannot be empty");
            Secret = secret;
            UpdateTimestamp();
        }

        public void SetNasIdentifier(string? identifier)
        {
            NasIdentifier = identifier;
            UpdateTimestamp();
        }

        public void SetRealm(string? realm)
        {
            Realm = realm;
            UpdateTimestamp();
        }

        public void SetAcctPort(int? port)
        {
            if (port.HasValue && (port < 1 || port > 65535))
                throw new ArgumentException("Accounting port must be between 1 and 65535");
            AcctPort = port;
            UpdateTimestamp();
        }

        public void SetTimeout(int? milliseconds)
        {
            if (milliseconds.HasValue && milliseconds <= 0)
                throw new ArgumentException("Timeout must be positive");
            TimeoutMs = milliseconds;
            UpdateTimestamp();
        }

        public void SetRetries(int? retries)
        {
            if (retries.HasValue && retries < 0)
                throw new ArgumentException("Retries cannot be negative");
            Retries = retries;
            UpdateTimestamp();
        }

        private void UpdateTimestamp() => UpdatedAt = DateTime.UtcNow;
    }
}
