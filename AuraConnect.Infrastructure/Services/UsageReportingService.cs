using AuraConnect.Application.DTOs.Metrics;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;

namespace AuraConnect.Infrastructure.Services
{
    public class UsageReportingService : IUsageReportingService
    {
        private const int UnattributedSampleUsernameLimit = 5;

        private readonly IRadiusAccountingClient _radiusAccountingClient;
        private readonly ISiteRepository _siteRepository;
        private readonly IUserPackageRepository _userPackageRepository;
        private readonly IGatewaySessionEventRepository _gatewaySessionEventRepository;

        public UsageReportingService(
            IRadiusAccountingClient radiusAccountingClient,
            ISiteRepository siteRepository,
            IUserPackageRepository userPackageRepository,
            IGatewaySessionEventRepository gatewaySessionEventRepository)
        {
            _radiusAccountingClient = radiusAccountingClient;
            _siteRepository = siteRepository;
            _userPackageRepository = userPackageRepository;
            _gatewaySessionEventRepository = gatewaySessionEventRepository;
        }

        public async Task<UsageTrendResponse> GetUsageTrendAsync(
            string? siteId, string? tenantId, DateTime from, DateTime to, string granularity, CancellationToken cancellationToken = default)
        {
            var allSites = (await _siteRepository.GetAllAsync(cancellationToken)).ToList();
            var scope = ResolveScope(allSites, siteId, tenantId);

            var rows = await _radiusAccountingClient.GetDailySessionAggregatesAsync(from, to, cancellationToken);

            var byDate = new Dictionary<DateOnly, UsageTrendPointAccumulator>();
            long unattributedBytes = 0;

            foreach (var row in rows)
            {
                var matchedSite = MatchSite(row.CalledStationId, allSites);
                var inScope = matchedSite != null && scope.Contains(matchedSite.Id);

                if (matchedSite == null && scope.IsPlatformWide)
                {
                    unattributedBytes += row.BytesIn + row.BytesOut;
                    continue;
                }

                if (!inScope) continue;

                var date = DateOnly.FromDateTime(row.Date);
                if (!byDate.TryGetValue(date, out var acc))
                    acc = new UsageTrendPointAccumulator();

                acc.BytesIn += row.BytesIn;
                acc.BytesOut += row.BytesOut;
                acc.Sessions += row.Sessions;
                acc.UniqueUsers += row.UniqueUsers;
                byDate[date] = acc;
            }

            var points = byDate
                .OrderBy(kv => kv.Key)
                .Select(kv => new UsageTrendPoint
                {
                    Date = kv.Key,
                    BytesIn = kv.Value.BytesIn,
                    BytesOut = kv.Value.BytesOut,
                    Sessions = kv.Value.Sessions,
                    UniqueUsers = kv.Value.UniqueUsers
                })
                .ToList();

            return new UsageTrendResponse
            {
                Granularity = "day",
                Points = points,
                UnattributedBytes = scope.IsPlatformWide ? unattributedBytes : 0
            };
        }

        public async Task<KpiSummaryResponse> GetKpiSummaryAsync(
            string? siteId, string? tenantId, DateTime from, DateTime to, CancellationToken cancellationToken = default)
        {
            var allSites = (await _siteRepository.GetAllAsync(cancellationToken)).ToList();
            var scope = ResolveScope(allSites, siteId, tenantId);

            var rows = await _radiusAccountingClient.GetDailySessionAggregatesAsync(from, to, cancellationToken);

            long totalBytes = 0;
            var totalSessions = 0;
            var matchedCalledStationIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var row in rows)
            {
                var matchedSite = MatchSite(row.CalledStationId, allSites);
                if (matchedSite == null || !scope.Contains(matchedSite.Id)) continue;

                totalBytes += row.BytesIn + row.BytesOut;
                totalSessions += row.Sessions;
                matchedCalledStationIds.Add(row.CalledStationId);
            }

            var usernames = matchedCalledStationIds.Count > 0
                ? await _radiusAccountingClient.GetUsernamesByCalledStationIdsAsync(matchedCalledStationIds, from, to, cancellationToken)
                : [];

            var firstSeen = matchedCalledStationIds.Count > 0
                ? await _radiusAccountingClient.GetUsernameFirstSeenAsync(matchedCalledStationIds, from, to, cancellationToken)
                : [];

            var newUsers = firstSeen.Count(f => f.FirstSeen >= from);
            var returningUsers = firstSeen.Count - newUsers;

            return new KpiSummaryResponse
            {
                TotalDataGb = Math.Round(totalBytes / 1_000_000_000.0, 2),
                TotalSessions = totalSessions,
                UniqueUsers = usernames.Count,
                NewUsers = newUsers,
                ReturningUsers = returningUsers
            };
        }

        public async Task<SiteLeaderboardResponse> GetSiteLeaderboardAsync(
            DateTime from, DateTime to, string metric, CancellationToken cancellationToken = default)
        {
            var allSites = (await _siteRepository.GetAllAsync(cancellationToken)).ToList();
            var rows = await _radiusAccountingClient.GetDailySessionAggregatesAsync(from, to, cancellationToken);

            var totalsBySite = new Dictionary<string, (long Bytes, int Sessions)>();
            foreach (var row in rows)
            {
                var matchedSite = MatchSite(row.CalledStationId, allSites);
                if (matchedSite == null) continue;

                totalsBySite.TryGetValue(matchedSite.Id, out var current);
                totalsBySite[matchedSite.Id] = (current.Bytes + row.BytesIn + row.BytesOut, current.Sessions + row.Sessions);
            }

            var ranked = totalsBySite
                .Select(kv => new
                {
                    Site = allSites.First(s => s.Id == kv.Key),
                    Value = string.Equals(metric, "sessions", StringComparison.OrdinalIgnoreCase)
                        ? kv.Value.Sessions
                        : Math.Round(kv.Value.Bytes / 1_000_000_000.0, 2)
                })
                .OrderByDescending(x => x.Value)
                .Select((x, i) => new SiteLeaderboardEntry
                {
                    SiteId = x.Site.Id,
                    SiteName = x.Site.Name,
                    Value = x.Value,
                    Rank = i + 1
                })
                .ToList();

            return new SiteLeaderboardResponse { Metric = metric, Entries = ranked };
        }

        public async Task<ActiveSessionsResponse> GetActiveSessionsSummaryAsync(
            string? siteId, string? tenantId, CancellationToken cancellationToken = default)
        {
            var allSites = (await _siteRepository.GetAllAsync(cancellationToken)).ToList();
            var scope = ResolveScope(allSites, siteId, tenantId);

            var sessions = await _radiusAccountingClient.GetActiveSessionsAsync(cancellationToken);

            var countsBySite = new Dictionary<string, int>();
            var totalActive = 0;
            foreach (var session in sessions)
            {
                var matchedSite = MatchSite(session.CalledStationId, allSites);
                if (matchedSite == null || !scope.Contains(matchedSite.Id)) continue;

                countsBySite.TryGetValue(matchedSite.Id, out var current);
                countsBySite[matchedSite.Id] = current + 1;
                totalActive++;
            }

            var bySite = countsBySite
                .Select(kv => new ActiveSessionsBySite
                {
                    SiteId = kv.Key,
                    SiteName = allSites.First(s => s.Id == kv.Key).Name,
                    ActiveCount = kv.Value
                })
                .OrderByDescending(s => s.ActiveCount)
                .ToList();

            return new ActiveSessionsResponse { CheckedAt = DateTime.UtcNow, TotalActive = totalActive, BySite = bySite };
        }

        public async Task<LoginHealthResponse> GetLoginHealthAsync(
            string? siteId, DateTime from, DateTime to, CancellationToken cancellationToken = default)
        {
            // Sourced entirely from GatewaySessionEvent — it's already cleanly scoped by SiteId and
            // LoginError already carries the same $(error) string MikroTik gives us, so there's no
            // need for radpostauth's heavier username-resolution indirection here.
            var (_, successTotal) = await _gatewaySessionEventRepository.GetPagedAsync(
                1, 1, null, siteId, null, GatewayLoginOutcome.Success, from, to, cancellationToken);
            var (failedItems, failureTotal) = await _gatewaySessionEventRepository.GetPagedAsync(
                1, 1000, null, siteId, null, GatewayLoginOutcome.Failed, from, to, cancellationToken);

            var failuresByReason = failedItems
                .GroupBy(e => string.IsNullOrWhiteSpace(e.LoginError) ? "unknown" : e.LoginError)
                .Select(g => new LoginFailureReason { Reason = g.Key, Count = g.Count() })
                .OrderByDescending(r => r.Count)
                .ToList();

            return new LoginHealthResponse
            {
                TotalAttempts = successTotal + failureTotal,
                SuccessCount = successTotal,
                FailureCount = failureTotal,
                FailuresByReason = failuresByReason
            };
        }

        public async Task<MyUsageResponse> GetMyUsageAsync(string profileId, DateTime from, DateTime to, CancellationToken cancellationToken = default)
        {
            var userPackages = (await _userPackageRepository.GetByProfileIdAsync(profileId, cancellationToken)).ToList();
            var usernames = userPackages
                .Where(p => !string.IsNullOrWhiteSpace(p.RdUsername))
                .Select(p => p.RdUsername!)
                .Distinct()
                .ToList();

            if (usernames.Count == 0)
                return new MyUsageResponse();

            var dailyUsage = await _radiusAccountingClient.GetDailyUsageByUsernamesAsync(usernames, from, to, cancellationToken);

            var points = dailyUsage
                .Select(d => new MyUsagePoint { Date = DateOnly.FromDateTime(d.Date), BytesIn = d.BytesIn, BytesOut = d.BytesOut })
                .OrderBy(p => p.Date)
                .ToList();

            var currentPackage = userPackages
                .Where(p => p.Status == UserPackageStatus.Active)
                .OrderByDescending(p => p.PurchasedAt)
                .FirstOrDefault();

            long? dataCapBytes = null;
            if (currentPackage?.Package is { DataLimitEnabled: true, DataAmount: not null } package)
                dataCapBytes = ConvertToBytes(package.DataAmount.Value, package.DataUnit);

            var dataUsedBytes = points.Sum(p => p.BytesIn + p.BytesOut);

            return new MyUsageResponse
            {
                Points = points,
                PackageDataCapBytes = dataCapBytes,
                PackageDataUsedBytes = dataCapBytes.HasValue ? dataUsedBytes : null
            };
        }

        public async Task<UnattributedStationsResponse> GetUnattributedStationsAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default)
        {
            var allSites = (await _siteRepository.GetAllAsync(cancellationToken)).ToList();
            var summaries = await _radiusAccountingClient.GetCalledStationSummariesAsync(from, to, cancellationToken);

            var entries = new List<UnattributedStationEntry>();
            foreach (var summary in summaries)
            {
                if (MatchSite(summary.CalledStationId, allSites) != null) continue;

                var sampleUsernames = await _radiusAccountingClient.GetSampleUsernamesAsync(
                    summary.CalledStationId, UnattributedSampleUsernameLimit, cancellationToken);

                entries.Add(new UnattributedStationEntry
                {
                    CalledStationId = summary.CalledStationId,
                    Sessions = summary.Sessions,
                    FirstSeen = summary.FirstSeen,
                    LastSeen = summary.LastSeen,
                    SampleUsernames = sampleUsernames
                });
            }

            return new UnattributedStationsResponse { Entries = entries.OrderByDescending(e => e.Sessions).ToList() };
        }

        // Normalizes by lowercasing and stripping non-alphanumeric characters, then compares the
        // calledstationid against each candidate site's Ssid, Name, and RadiusCalledStationIds aliases.
        // Deliberately exact-after-normalization, not fuzzy/edit-distance — see the plan for why.
        private static Site? MatchSite(string calledStationId, IReadOnlyList<Site> sites)
        {
            var normalizedInput = Normalize(calledStationId);
            foreach (var site in sites)
            {
                if (Normalize(site.Ssid) == normalizedInput) return site;
                if (Normalize(site.Name) == normalizedInput) return site;
                if (site.RadiusCalledStationIds.Any(alias => Normalize(alias) == normalizedInput)) return site;
            }
            return null;
        }

        private static string Normalize(string value) =>
            new(value.Where(char.IsLetterOrDigit).Select(char.ToLowerInvariant).ToArray());

        private static ReportingScope ResolveScope(IReadOnlyList<Site> allSites, string? siteId, string? tenantId)
        {
            if (!string.IsNullOrWhiteSpace(siteId))
            {
                var site = allSites.FirstOrDefault(s => s.Id == siteId)
                    ?? throw new InvalidOperationException($"Site with ID '{siteId}' not found");
                return new ReportingScope(new HashSet<string> { site.Id }, isPlatformWide: false);
            }

            if (!string.IsNullOrWhiteSpace(tenantId))
            {
                var siteIds = allSites.Where(s => s.TenantId == tenantId).Select(s => s.Id).ToHashSet();
                return new ReportingScope(siteIds, isPlatformWide: false);
            }

            return new ReportingScope(allSites.Select(s => s.Id).ToHashSet(), isPlatformWide: true);
        }

        private static long ConvertToBytes(int amount, string? unit) => unit?.ToLowerInvariant() switch
        {
            "gb" => amount * 1_000_000_000L,
            "mb" => amount * 1_000_000L,
            "kb" => amount * 1_000L,
            _ => amount
        };

        private struct UsageTrendPointAccumulator
        {
            public long BytesIn;
            public long BytesOut;
            public int Sessions;
            public int UniqueUsers;
        }

        private sealed class ReportingScope
        {
            private readonly HashSet<string> _siteIds;
            public bool IsPlatformWide { get; }

            public ReportingScope(HashSet<string> siteIds, bool isPlatformWide)
            {
                _siteIds = siteIds;
                IsPlatformWide = isPlatformWide;
            }

            public bool Contains(string siteId) => _siteIds.Contains(siteId);
        }
    }
}
