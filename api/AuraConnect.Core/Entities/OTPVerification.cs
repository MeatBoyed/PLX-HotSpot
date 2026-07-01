using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Core.Entities
{
    public class OtpVerification
    {
        public string Id { get; private set; } = Guid.NewGuid().ToString("N");
        public string? SiteId { get; private set; }
        public string Msisdn { get; private set; } = string.Empty;
        public string OtpCode { get; private set; } = string.Empty;
        public int Attempts { get; private set; }
        public bool Verified { get; private set; }
        public string? IpAddress { get; private set; }
        public string? UserAgent { get; private set; }
        public string? MacAddress { get; private set; }
        public DateTime ExpiresAt { get; private set; }
        public DateTime? VerifiedAt { get; private set; }
        public DateTime CreatedAt { get; private set; }

        // Navigation
        public virtual Site Site { get; private set; } = null!;

        // Business properties
        public bool IsExpired => DateTime.UtcNow > ExpiresAt;
        public bool CanRetry => Attempts < MaxAttempts && !IsExpired;
        public const int MaxAttempts = 3;
        public static readonly TimeSpan OtpLifetime = TimeSpan.FromMinutes(5);

        // EF Core constructor
        private OtpVerification() { }

        // Domain constructor
        public OtpVerification(string siteId, string msisdn, string otpCode, string? ipAddress = null, string? userAgent = null, string? macAddress = null)
        {
            Id = Guid.NewGuid().ToString("N");
            SiteId = siteId;
            Msisdn = msisdn;
            OtpCode = otpCode;
            IpAddress = ipAddress;
            UserAgent = userAgent;
            MacAddress = macAddress;
            ExpiresAt = DateTime.UtcNow.Add(OtpLifetime);
            CreatedAt = DateTime.UtcNow;
            Attempts = 0;
            Verified = false;
        }

        // Domain behaviors
        public bool Verify(string enteredCode)
        {
            if (Verified)
                throw new InvalidOperationException("OTP already verified");

            if (IsExpired)
                throw new InvalidOperationException("OTP has expired");

            if (Attempts >= MaxAttempts)
                throw new InvalidOperationException("Maximum verification attempts exceeded");

            Attempts++;

            if (enteredCode == OtpCode)
            {
                Verified = true;
                VerifiedAt = DateTime.UtcNow;
                return true;
            }

            return false;
        }

        public void RegenerateOtp(string newOtpCode)
        {
            if (Verified)
                throw new InvalidOperationException("Cannot regenerate verified OTP");

            OtpCode = newOtpCode;
            ExpiresAt = DateTime.UtcNow.Add(OtpLifetime);
            Attempts = 0;
        }
    }
}
