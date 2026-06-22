namespace AuraConnect.Application.DTOs.MikroTik
{
    public class MikroTikCertificateInfo
    {
        public string Name { get; init; } = string.Empty;
        public string? CommonName { get; init; }
        public bool IsExpired { get; init; }
        public DateTime? ExpiryDate { get; init; }
        public string? ExpiryDateRaw { get; init; }
        public int? DaysUntilExpiry { get; init; }
        public IReadOnlyList<string> SubjectAlternativeNames { get; init; } = [];
    }
}
