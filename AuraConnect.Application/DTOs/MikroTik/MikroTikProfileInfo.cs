namespace AuraConnect.Application.DTOs.MikroTik
{
    public class MikroTikProfileInfo
    {
        public string Name { get; init; } = string.Empty;
        public string? DnsName { get; init; }
        public string? HotspotAddress { get; init; }
        public string? HtmlDirectory { get; init; }
        public string? HtmlDirectoryOverride { get; init; }
        public bool UseRadius { get; init; }
        public bool RadiusAccounting { get; init; }
        public string? RadiusInterimUpdate { get; init; }
        public string? SslCertificateName { get; init; }
    }
}
