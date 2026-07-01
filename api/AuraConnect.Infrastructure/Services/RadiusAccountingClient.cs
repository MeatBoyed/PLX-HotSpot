using AuraConnect.Core.Interfaces.Repositories;
using MySqlConnector;

namespace AuraConnect.Infrastructure.Services
{
    public class RadiusAccountingClient : IRadiusAccountingClient
    {
        private readonly IPlatformSettingsRepository _platformSettingsRepository;

        public RadiusAccountingClient(IPlatformSettingsRepository platformSettingsRepository)
        {
            _platformSettingsRepository = platformSettingsRepository;
        }

        public async Task<IReadOnlyList<RadiusDailySessionAggregate>> GetDailySessionAggregatesAsync(
            DateTime from, DateTime to, CancellationToken cancellationToken = default)
        {
            const string sql = """
                SELECT calledstationid AS CalledStationId, DATE(acctstarttime) AS Date,
                       SUM(acctinputoctets) AS BytesIn, SUM(acctoutputoctets) AS BytesOut,
                       COUNT(*) AS Sessions, COUNT(DISTINCT username) AS UniqueUsers
                FROM (
                    SELECT calledstationid, acctstarttime, acctinputoctets, acctoutputoctets, username
                    FROM radacct WHERE acctstarttime BETWEEN @from AND @to
                    UNION ALL
                    SELECT calledstationid, acctstarttime, acctinputoctets, acctoutputoctets, username
                    FROM radacct_history WHERE acctstarttime BETWEEN @from AND @to
                ) combined
                GROUP BY calledstationid, DATE(acctstarttime)
                """;

            await using var connection = await OpenConnectionAsync(cancellationToken);
            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@from", from);
            command.Parameters.AddWithValue("@to", to);

            var results = new List<RadiusDailySessionAggregate>();
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                results.Add(new RadiusDailySessionAggregate
                {
                    CalledStationId = reader.GetString("CalledStationId"),
                    Date = reader.GetDateTime("Date"),
                    BytesIn = reader.IsDBNull(reader.GetOrdinal("BytesIn")) ? 0 : reader.GetInt64("BytesIn"),
                    BytesOut = reader.IsDBNull(reader.GetOrdinal("BytesOut")) ? 0 : reader.GetInt64("BytesOut"),
                    Sessions = reader.GetInt32("Sessions"),
                    UniqueUsers = reader.GetInt32("UniqueUsers")
                });
            }
            return results;
        }

        public async Task<IReadOnlyList<RadiusCalledStationSummary>> GetCalledStationSummariesAsync(
            DateTime from, DateTime to, CancellationToken cancellationToken = default)
        {
            const string sql = """
                SELECT calledstationid AS CalledStationId, COUNT(*) AS Sessions,
                       MIN(acctstarttime) AS FirstSeen, MAX(acctstarttime) AS LastSeen
                FROM (
                    SELECT calledstationid, acctstarttime FROM radacct WHERE acctstarttime BETWEEN @from AND @to
                    UNION ALL
                    SELECT calledstationid, acctstarttime FROM radacct_history WHERE acctstarttime BETWEEN @from AND @to
                ) combined
                GROUP BY calledstationid
                """;

            await using var connection = await OpenConnectionAsync(cancellationToken);
            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@from", from);
            command.Parameters.AddWithValue("@to", to);

            var results = new List<RadiusCalledStationSummary>();
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                results.Add(new RadiusCalledStationSummary
                {
                    CalledStationId = reader.GetString("CalledStationId"),
                    Sessions = reader.GetInt32("Sessions"),
                    FirstSeen = reader.GetDateTime("FirstSeen"),
                    LastSeen = reader.GetDateTime("LastSeen")
                });
            }
            return results;
        }

        public async Task<IReadOnlyList<string>> GetSampleUsernamesAsync(
            string calledStationId, int limit, CancellationToken cancellationToken = default)
        {
            const string sql = "SELECT DISTINCT username FROM radacct_history WHERE calledstationid = @calledStationId LIMIT @limit";

            await using var connection = await OpenConnectionAsync(cancellationToken);
            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@calledStationId", calledStationId);
            command.Parameters.AddWithValue("@limit", limit);

            var results = new List<string>();
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
                results.Add(reader.GetString(0));
            return results;
        }

        public async Task<IReadOnlyList<RadiusDailyUsage>> GetDailyUsageByUsernamesAsync(
            IEnumerable<string> usernames, DateTime from, DateTime to, CancellationToken cancellationToken = default)
        {
            var usernameList = usernames.ToList();
            if (usernameList.Count == 0) return [];

            await using var connection = await OpenConnectionAsync(cancellationToken);
            await using var command = connection.CreateCommand();
            var inClause = BuildInClause(command, "u", usernameList);
            command.CommandText = $"""
                SELECT DATE(timestamp) AS Date, SUM(acctinputoctets) AS BytesIn, SUM(acctoutputoctets) AS BytesOut
                FROM user_stats_dailies
                WHERE username IN ({inClause}) AND timestamp BETWEEN @from AND @to
                GROUP BY DATE(timestamp)
                """;
            command.Parameters.AddWithValue("@from", from);
            command.Parameters.AddWithValue("@to", to);

            var results = new List<RadiusDailyUsage>();
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                results.Add(new RadiusDailyUsage
                {
                    Date = reader.GetDateTime("Date"),
                    BytesIn = reader.IsDBNull(reader.GetOrdinal("BytesIn")) ? 0 : reader.GetInt64("BytesIn"),
                    BytesOut = reader.IsDBNull(reader.GetOrdinal("BytesOut")) ? 0 : reader.GetInt64("BytesOut")
                });
            }
            return results;
        }

        public async Task<IReadOnlyList<RadiusActiveSession>> GetActiveSessionsAsync(CancellationToken cancellationToken = default)
        {
            const string sql = "SELECT calledstationid AS CalledStationId, username AS Username FROM radacct WHERE acctstoptime IS NULL";

            await using var connection = await OpenConnectionAsync(cancellationToken);
            await using var command = new MySqlCommand(sql, connection);

            var results = new List<RadiusActiveSession>();
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                results.Add(new RadiusActiveSession
                {
                    CalledStationId = reader.GetString("CalledStationId"),
                    Username = reader.GetString("Username")
                });
            }
            return results;
        }

        public async Task<IReadOnlyList<string>> GetUsernamesByCalledStationIdsAsync(
            IEnumerable<string> calledStationIds, DateTime from, DateTime to, CancellationToken cancellationToken = default)
        {
            var stationList = calledStationIds.ToList();
            if (stationList.Count == 0) return [];

            await using var connection = await OpenConnectionAsync(cancellationToken);
            await using var command = connection.CreateCommand();
            var inClause = BuildInClause(command, "cs", stationList);
            command.CommandText = $"""
                SELECT DISTINCT username FROM (
                    SELECT username, calledstationid, acctstarttime FROM radacct WHERE acctstarttime BETWEEN @from AND @to
                    UNION ALL
                    SELECT username, calledstationid, acctstarttime FROM radacct_history WHERE acctstarttime BETWEEN @from AND @to
                ) combined
                WHERE calledstationid IN ({inClause})
                """;
            command.Parameters.AddWithValue("@from", from);
            command.Parameters.AddWithValue("@to", to);

            var results = new List<string>();
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
                results.Add(reader.GetString(0));
            return results;
        }

        public async Task<IReadOnlyList<RadiusAuthReplyCount>> GetAuthReplyCountsAsync(
            IEnumerable<string>? usernames, DateTime from, DateTime to, CancellationToken cancellationToken = default)
        {
            await using var connection = await OpenConnectionAsync(cancellationToken);
            await using var command = connection.CreateCommand();

            var usernameList = usernames?.ToList();
            var usernameFilter = string.Empty;
            if (usernameList is { Count: > 0 })
            {
                var inClause = BuildInClause(command, "u", usernameList);
                usernameFilter = $"AND username IN ({inClause})";
            }

            command.CommandText = $"""
                SELECT reply AS Reply, COUNT(*) AS Count
                FROM radpostauth
                WHERE authdate BETWEEN @from AND @to {usernameFilter}
                GROUP BY reply
                """;
            command.Parameters.AddWithValue("@from", from);
            command.Parameters.AddWithValue("@to", to);

            var results = new List<RadiusAuthReplyCount>();
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                results.Add(new RadiusAuthReplyCount
                {
                    Reply = reader.GetString("Reply"),
                    Count = Convert.ToInt32(reader.GetInt64("Count"))
                });
            }
            return results;
        }

        public async Task<IReadOnlyList<RadiusUsernameFirstSeen>> GetUsernameFirstSeenAsync(
            IEnumerable<string>? calledStationIds, DateTime from, DateTime to, CancellationToken cancellationToken = default)
        {
            await using var connection = await OpenConnectionAsync(cancellationToken);
            await using var command = connection.CreateCommand();

            var stationList = calledStationIds?.ToList();
            var stationFilter = string.Empty;
            if (stationList is { Count: > 0 })
            {
                var inClause = BuildInClause(command, "cs", stationList);
                stationFilter = $"WHERE calledstationid IN ({inClause})";
            }

            // First-seen is computed globally (across all history), restricted to usernames active in the
            // requested range — a user is "new" if their global first session falls inside [from, to].
            command.CommandText = $"""
                SELECT a.username AS Username, MIN(b.acctstarttime) AS FirstSeen
                FROM (
                    SELECT DISTINCT username FROM (
                        SELECT username, calledstationid, acctstarttime FROM radacct WHERE acctstarttime BETWEEN @from AND @to
                        UNION ALL
                        SELECT username, calledstationid, acctstarttime FROM radacct_history WHERE acctstarttime BETWEEN @from AND @to
                    ) in_range
                    {stationFilter}
                ) a
                JOIN (
                    SELECT username, acctstarttime FROM radacct
                    UNION ALL
                    SELECT username, acctstarttime FROM radacct_history
                ) b ON a.username = b.username
                GROUP BY a.username
                """;
            command.Parameters.AddWithValue("@from", from);
            command.Parameters.AddWithValue("@to", to);

            var results = new List<RadiusUsernameFirstSeen>();
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                results.Add(new RadiusUsernameFirstSeen
                {
                    Username = reader.GetString("Username"),
                    FirstSeen = reader.GetDateTime("FirstSeen")
                });
            }
            return results;
        }

        private async Task<MySqlConnection> OpenConnectionAsync(CancellationToken cancellationToken)
        {
            var settings = await _platformSettingsRepository.GetAsync(cancellationToken);
            if (settings == null || !settings.IsRadiusDbConfigured)
                throw new InvalidOperationException("RADIUS database is not configured. Set credentials via PATCH /api/admin/platform/settings/radius-db.");

            var connectionString = new MySqlConnectionStringBuilder
            {
                Server = settings.RadiusDbHost,
                Port = (uint)settings.RadiusDbPort!.Value,
                Database = settings.RadiusDbName,
                UserID = settings.RadiusDbUsername,
                Password = settings.RadiusDbPassword,
                ConnectionTimeout = 10
            }.ConnectionString;

            var connection = new MySqlConnection(connectionString);
            await connection.OpenAsync(cancellationToken);
            return connection;
        }

        // MySqlConnector has no built-in list-parameter expansion — build numbered placeholders by hand.
        private static string BuildInClause(MySqlCommand command, string prefix, IReadOnlyList<string> values)
        {
            var names = new string[values.Count];
            for (var i = 0; i < values.Count; i++)
            {
                var paramName = $"@{prefix}{i}";
                names[i] = paramName;
                command.Parameters.AddWithValue(paramName, values[i]);
            }
            return string.Join(",", names);
        }
    }
}
