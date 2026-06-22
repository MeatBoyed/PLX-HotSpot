using AuraConnect.Application.DTOs.MikroTik;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace AuraConnect.Infrastructure.Services
{
    public class MikroTikGatewayService : IMikroTikGatewayService
    {
        private const string ExpectedFirewallListName = "hotspot-list";

        private static readonly string[] RouterOsDateFormats =
        [
            "MMM/dd/yyyy HH:mm:ss",
            "MMM/dd/yyyy"
        ];

        private enum ProfileResolutionOutcome { Resolved, GatewayUrlNotConfigured, ProfileNotFound }

        private sealed record ProfileResolution(
            ProfileResolutionOutcome Outcome,
            string? GatewayUrl,
            PlatformSettings? Settings,
            MikroTikHotspotProfileDto? Profile,
            MikroTikHotspotServerDto? Server);

        private readonly ISiteRepository _siteRepository;
        private readonly IRadiusConfigRepository _radiusConfigRepository;
        private readonly IPlatformSettingsRepository _platformSettingsRepository;
        private readonly IHttpClientFactory _httpClientFactory;

        public MikroTikGatewayService(
            ISiteRepository siteRepository,
            IRadiusConfigRepository radiusConfigRepository,
            IPlatformSettingsRepository platformSettingsRepository,
            IHttpClientFactory httpClientFactory)
        {
            _siteRepository = siteRepository;
            _radiusConfigRepository = radiusConfigRepository;
            _platformSettingsRepository = platformSettingsRepository;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<MikroTikGatewayStatusResponse> GetSiteGatewayStatusAsync(string siteId, CancellationToken cancellationToken = default)
        {
            var resolution = await ResolveProfileAndServerAsync(siteId, cancellationToken);

            if (resolution.Outcome != ProfileResolutionOutcome.Resolved)
            {
                return new MikroTikGatewayStatusResponse
                {
                    SiteId = siteId,
                    GatewayUrl = resolution.GatewayUrl,
                    Status = resolution.Outcome == ProfileResolutionOutcome.GatewayUrlNotConfigured
                        ? MikroTikGatewayHealthStatus.GatewayUrlNotConfigured
                        : MikroTikGatewayHealthStatus.ProfileNotFound,
                    CheckedAt = DateTime.UtcNow
                };
            }

            var settings = resolution.Settings!;
            var profile = resolution.Profile!;
            var server = resolution.Server;

            var certificates = await GetAsync<MikroTikCertificateDto>(settings, "/certificate", cancellationToken);
            var certificate = certificates.FirstOrDefault(c => string.Equals(c.Name, profile.SslCertificate, StringComparison.OrdinalIgnoreCase));
            var certificateInfo = certificate == null ? null : MapCertificate(certificate);

            return new MikroTikGatewayStatusResponse
            {
                SiteId = siteId,
                GatewayUrl = resolution.GatewayUrl,
                Status = ComputeGatewayStatus(profile, server, certificate, certificateInfo),
                Profile = MapProfile(profile),
                Certificate = certificateInfo,
                Server = server == null ? null : MapServer(server),
                CheckedAt = DateTime.UtcNow
            };
        }

        public async Task<MikroTikNetworkStatusResponse> GetSiteNetworkStatusAsync(string siteId, CancellationToken cancellationToken = default)
        {
            var resolution = await ResolveProfileAndServerAsync(siteId, cancellationToken);

            if (resolution.Outcome != ProfileResolutionOutcome.Resolved)
            {
                return new MikroTikNetworkStatusResponse
                {
                    SiteId = siteId,
                    Status = resolution.Outcome == ProfileResolutionOutcome.GatewayUrlNotConfigured
                        ? MikroTikNetworkHealthStatus.GatewayUrlNotConfigured
                        : MikroTikNetworkHealthStatus.ProfileNotFound,
                    CheckedAt = DateTime.UtcNow
                };
            }

            var settings = resolution.Settings!;
            var server = resolution.Server;

            if (server == null)
            {
                return new MikroTikNetworkStatusResponse
                {
                    SiteId = siteId,
                    Status = MikroTikNetworkHealthStatus.ServerNotFound,
                    CheckedAt = DateTime.UtcNow
                };
            }

            var interfaceName = server.Interface;

            var addresses = await GetAsync<MikroTikIpAddressDto>(settings, "/ip/address", cancellationToken);
            var address = addresses.FirstOrDefault(a => string.Equals(a.Interface, interfaceName, StringComparison.OrdinalIgnoreCase));

            if (address == null)
            {
                return new MikroTikNetworkStatusResponse
                {
                    SiteId = siteId,
                    Status = MikroTikNetworkHealthStatus.IpAddressNotFound,
                    Interface = interfaceName,
                    CheckedAt = DateTime.UtcNow
                };
            }

            var cidr = BuildCidr(address);

            var pools = await GetAsync<MikroTikPoolDto>(settings, "/ip/pool", cancellationToken);
            var pool = pools.FirstOrDefault(p => string.Equals(p.Name, server.AddressPool, StringComparison.OrdinalIgnoreCase));

            var dhcpServers = await GetAsync<MikroTikDhcpServerDto>(settings, "/ip/dhcp-server", cancellationToken);
            var dhcpServer = dhcpServers.FirstOrDefault(d => string.Equals(d.Interface, interfaceName, StringComparison.OrdinalIgnoreCase));
            var dhcpServerInfo = dhcpServer == null ? null : MapDhcpServer(dhcpServer, server.AddressPool);

            var dhcpNetworks = await GetAsync<MikroTikDhcpNetworkDto>(settings, "/ip/dhcp-server/network", cancellationToken);
            var dhcpNetwork = dhcpNetworks.FirstOrDefault(n => string.Equals(n.Address, cidr, StringComparison.OrdinalIgnoreCase));
            var dhcpNetworkInfo = dhcpNetwork == null ? null : MapDhcpNetwork(dhcpNetwork, address);

            var firewallEntries = await GetAsync<MikroTikFirewallAddressListDto>(settings, "/ip/firewall/address-list", cancellationToken);
            var matchingFirewallEntries = firewallEntries
                .Where(f => string.Equals(f.Address, cidr, StringComparison.OrdinalIgnoreCase))
                .ToList();
            var firewallInfo = MapFirewall(matchingFirewallEntries);

            return new MikroTikNetworkStatusResponse
            {
                SiteId = siteId,
                Status = ComputeNetworkStatus(pool, dhcpServer, dhcpServerInfo, dhcpNetwork, dhcpNetworkInfo, firewallInfo),
                Interface = interfaceName,
                IpAddress = new MikroTikIpAddressInfo { Address = address.Address ?? string.Empty, Network = cidr },
                Pool = pool == null ? null : MapPool(pool),
                DhcpServer = dhcpServerInfo,
                DhcpNetwork = dhcpNetworkInfo,
                Firewall = firewallInfo,
                CheckedAt = DateTime.UtcNow
            };
        }

        private async Task<ProfileResolution> ResolveProfileAndServerAsync(string siteId, CancellationToken cancellationToken)
        {
            var site = await _siteRepository.GetByIdAsync(siteId, cancellationToken);
            if (site == null)
                throw new InvalidOperationException($"Site with ID '{siteId}' not found");

            var settings = await _platformSettingsRepository.GetAsync(cancellationToken);
            if (settings == null || !settings.IsMikroTikConfigured)
                throw new InvalidOperationException("MikroTik is not configured. Set credentials via PATCH /api/admin/platform/settings/mikrotik.");

            var radiusConfig = await _radiusConfigRepository.GetBySiteIdAsync(siteId, cancellationToken);
            var gatewayUrl = radiusConfig?.GatewayUrl;

            if (string.IsNullOrWhiteSpace(gatewayUrl))
                return new ProfileResolution(ProfileResolutionOutcome.GatewayUrlNotConfigured, gatewayUrl, settings, null, null);

            var host = new Uri(gatewayUrl).Host;

            var profiles = await GetAsync<MikroTikHotspotProfileDto>(settings, "/ip/hotspot/profile", cancellationToken);
            var profile = profiles.FirstOrDefault(p => string.Equals(p.DnsName, host, StringComparison.OrdinalIgnoreCase));

            if (profile == null)
                return new ProfileResolution(ProfileResolutionOutcome.ProfileNotFound, gatewayUrl, settings, null, null);

            var servers = await GetAsync<MikroTikHotspotServerDto>(settings, "/ip/hotspot", cancellationToken);
            var server = servers.FirstOrDefault(s => string.Equals(s.Profile, profile.Name, StringComparison.OrdinalIgnoreCase));

            return new ProfileResolution(ProfileResolutionOutcome.Resolved, gatewayUrl, settings, profile, server);
        }

        private async Task<IReadOnlyList<T>> GetAsync<T>(PlatformSettings settings, string path, CancellationToken cancellationToken)
        {
            var client = _httpClientFactory.CreateClient("MikroTik");
            var request = new HttpRequestMessage(HttpMethod.Get, $"https://{settings.MikroTikApiHost}/rest{path}");
            var authBytes = Encoding.UTF8.GetBytes($"{settings.MikroTikUsername}:{settings.MikroTikPassword}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(authBytes));

            var response = await client.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<List<T>>(cancellationToken: cancellationToken);
            return result ?? [];
        }

        private static MikroTikProfileInfo MapProfile(MikroTikHotspotProfileDto profile) => new()
        {
            Name = profile.Name ?? string.Empty,
            DnsName = profile.DnsName,
            HotspotAddress = profile.HotspotAddress,
            HtmlDirectory = profile.HtmlDirectory,
            HtmlDirectoryOverride = profile.HtmlDirectoryOverride,
            UseRadius = ParseRouterOsBool(profile.UseRadius),
            RadiusAccounting = ParseRouterOsBool(profile.RadiusAccounting),
            RadiusInterimUpdate = profile.RadiusInterimUpdate,
            SslCertificateName = profile.SslCertificate
        };

        private static MikroTikServerInfo MapServer(MikroTikHotspotServerDto server) => new()
        {
            Name = server.Name ?? string.Empty,
            Interface = server.Interface,
            AddressPool = server.AddressPool,
            IdleTimeout = server.IdleTimeout
        };

        private static MikroTikCertificateInfo MapCertificate(MikroTikCertificateDto cert)
        {
            var expiryDate = TryParseRouterOsDate(cert.InvalidAfter);
            var isExpiredByFlag = (cert.Flags ?? string.Empty).Contains('E');
            var isExpiredByDate = expiryDate.HasValue && expiryDate.Value < DateTime.UtcNow;

            var sans = (cert.SubjectAltName ?? string.Empty)
                .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.StartsWith("DNS:", StringComparison.OrdinalIgnoreCase) ? s[4..] : s)
                .ToList();

            return new MikroTikCertificateInfo
            {
                Name = cert.Name ?? string.Empty,
                CommonName = cert.CommonName,
                IsExpired = isExpiredByFlag || isExpiredByDate,
                ExpiryDate = expiryDate,
                ExpiryDateRaw = cert.InvalidAfter,
                DaysUntilExpiry = expiryDate.HasValue ? (int)Math.Floor((expiryDate.Value - DateTime.UtcNow).TotalDays) : null,
                SubjectAlternativeNames = sans
            };
        }

        private static MikroTikGatewayHealthStatus ComputeGatewayStatus(
            MikroTikHotspotProfileDto profile,
            MikroTikHotspotServerDto? server,
            MikroTikCertificateDto? certificate,
            MikroTikCertificateInfo? certificateInfo)
        {
            if (server == null) return MikroTikGatewayHealthStatus.ServerNotFound;
            if (certificate == null) return MikroTikGatewayHealthStatus.CertificateNotFound;
            if (certificateInfo!.IsExpired) return MikroTikGatewayHealthStatus.CertificateExpired;
            if (!ParseRouterOsBool(profile.UseRadius)) return MikroTikGatewayHealthStatus.RadiusNotEnabled;
            return MikroTikGatewayHealthStatus.Healthy;
        }

        private static string BuildCidr(MikroTikIpAddressDto address)
        {
            var slashIndex = address.Address?.IndexOf('/') ?? -1;
            var prefixLength = slashIndex >= 0 ? address.Address![(slashIndex + 1)..] : null;
            return prefixLength != null ? $"{address.Network}/{prefixLength}" : address.Network ?? string.Empty;
        }

        private static MikroTikPoolInfo MapPool(MikroTikPoolDto pool) => new()
        {
            Name = pool.Name ?? string.Empty,
            Ranges = pool.Ranges,
            // RouterOS's REST /ip/pool resource doesn't expose used/available — those are
            // print-only columns computed from current DHCP leases. Total is derived here
            // by counting the configured ranges; used/available are left null rather than guessed.
            Total = CountAddressesInRanges(pool.Ranges),
            Used = null,
            Available = null
        };

        private static int? CountAddressesInRanges(string? ranges)
        {
            if (string.IsNullOrWhiteSpace(ranges)) return null;

            var total = 0L;
            foreach (var range in ranges.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries))
            {
                var parts = range.Split('-');
                if (parts.Length != 2) continue;
                if (!IPAddress.TryParse(parts[0].Trim(), out var start) || !IPAddress.TryParse(parts[1].Trim(), out var end)) continue;

                var startValue = IpToUInt32(start);
                var endValue = IpToUInt32(end);
                if (endValue < startValue) continue;
                total += endValue - startValue + 1;
            }
            return total > 0 ? (int)total : null;
        }

        private static uint IpToUInt32(IPAddress ip)
        {
            var bytes = ip.GetAddressBytes();
            return ((uint)bytes[0] << 24) | ((uint)bytes[1] << 16) | ((uint)bytes[2] << 8) | bytes[3];
        }

        private static MikroTikDhcpServerInfo MapDhcpServer(MikroTikDhcpServerDto dhcpServer, string? hotspotServerAddressPool) => new()
        {
            Name = dhcpServer.Name ?? string.Empty,
            LeaseTime = dhcpServer.LeaseTime,
            AddressPool = dhcpServer.AddressPool,
            Disabled = ParseRouterOsBool(dhcpServer.Disabled),
            AddressPoolMatchesServer = string.Equals(dhcpServer.AddressPool, hotspotServerAddressPool, StringComparison.OrdinalIgnoreCase)
        };

        private static MikroTikDhcpNetworkInfo MapDhcpNetwork(MikroTikDhcpNetworkDto dhcpNetwork, MikroTikIpAddressDto address)
        {
            var slashIndex = address.Address?.IndexOf('/') ?? -1;
            var addressHost = slashIndex >= 0 ? address.Address![..slashIndex] : address.Address;

            return new MikroTikDhcpNetworkInfo
            {
                Address = dhcpNetwork.Address ?? string.Empty,
                Gateway = dhcpNetwork.Gateway,
                DnsServer = dhcpNetwork.DnsServer,
                GatewayMatchesAddress = string.Equals(dhcpNetwork.Gateway, addressHost, StringComparison.OrdinalIgnoreCase)
            };
        }

        private static MikroTikFirewallInfo MapFirewall(List<MikroTikFirewallAddressListDto> matchingEntries) => new()
        {
            ExpectedList = ExpectedFirewallListName,
            // Deliberately case-sensitive/exact — a near-miss list name (e.g. a typo'd
            // "hostpot-list") should surface as NOT listed rather than being treated as a match.
            IsListed = matchingEntries.Any(e => string.Equals(e.List, ExpectedFirewallListName, StringComparison.Ordinal)),
            MatchingEntries = matchingEntries.Select(e => new MikroTikFirewallEntry
            {
                List = e.List ?? string.Empty,
                Address = e.Address ?? string.Empty,
                CreationTime = TryParseRouterOsDate(e.CreationTime)
            }).ToList()
        };

        private static MikroTikNetworkHealthStatus ComputeNetworkStatus(
            MikroTikPoolDto? pool,
            MikroTikDhcpServerDto? dhcpServer,
            MikroTikDhcpServerInfo? dhcpServerInfo,
            MikroTikDhcpNetworkDto? dhcpNetwork,
            MikroTikDhcpNetworkInfo? dhcpNetworkInfo,
            MikroTikFirewallInfo firewallInfo)
        {
            if (pool == null) return MikroTikNetworkHealthStatus.PoolNotFound;
            if (dhcpServer == null) return MikroTikNetworkHealthStatus.DhcpServerNotFound;
            if (!dhcpServerInfo!.AddressPoolMatchesServer) return MikroTikNetworkHealthStatus.DhcpServerPoolMismatch;
            if (dhcpNetwork == null) return MikroTikNetworkHealthStatus.DhcpNetworkNotFound;
            if (!dhcpNetworkInfo!.GatewayMatchesAddress) return MikroTikNetworkHealthStatus.DhcpGatewayMismatch;
            if (!firewallInfo.IsListed) return MikroTikNetworkHealthStatus.NotInFirewallList;
            return MikroTikNetworkHealthStatus.Healthy;
        }

        private static bool ParseRouterOsBool(JsonElement element) => element.ValueKind switch
        {
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.String => element.GetString() is "yes" or "true",
            _ => false
        };

        private static DateTime? TryParseRouterOsDate(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            return DateTime.TryParseExact(
                raw, RouterOsDateFormats, CultureInfo.InvariantCulture,
                DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal, out var parsed)
                ? parsed
                : null;
        }
    }
}
