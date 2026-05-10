namespace AuraConnect.Application.Interfaces
{
    public record RadiusUsageStats(long BytesIn, long BytesOut, TimeSpan SessionTime);

    public interface IRadiusProvisioningService
    {
        Task<bool> CreateAccessUserAsync(string username, string password, string realmId, CancellationToken cancellationToken = default);
        Task<bool> AssignProfileAsync(string username, string profileName, CancellationToken cancellationToken = default);
        Task<bool> AssignRealmAsync(string username, string realmId, CancellationToken cancellationToken = default);
        Task<bool> EnableAccessAsync(string username, CancellationToken cancellationToken = default);
        Task<bool> DisableAccessAsync(string username, CancellationToken cancellationToken = default);
        Task<bool> DisconnectSessionAsync(string username, CancellationToken cancellationToken = default);
        Task<RadiusUsageStats?> GetUsageStatsAsync(string username, CancellationToken cancellationToken = default);
    }
}
