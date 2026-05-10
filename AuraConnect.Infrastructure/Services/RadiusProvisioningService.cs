using AuraConnect.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace AuraConnect.Infrastructure.Services
{
    public class RadiusProvisioningService : IRadiusProvisioningService
    {
        private readonly ILogger<RadiusProvisioningService> _logger;

        public RadiusProvisioningService(ILogger<RadiusProvisioningService> logger) => _logger = logger;

        public Task<bool> CreateAccessUserAsync(string username, string password, string realmId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("[RADIUS MOCK] CreateAccessUser: {Username} in realm {RealmId}", username, realmId);
            return Task.FromResult(true);
        }

        public Task<bool> AssignProfileAsync(string username, string profileName, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("[RADIUS MOCK] AssignProfile: {Username} → {Profile}", username, profileName);
            return Task.FromResult(true);
        }

        public Task<bool> AssignRealmAsync(string username, string realmId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("[RADIUS MOCK] AssignRealm: {Username} → {RealmId}", username, realmId);
            return Task.FromResult(true);
        }

        public Task<bool> EnableAccessAsync(string username, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("[RADIUS MOCK] EnableAccess: {Username}", username);
            return Task.FromResult(true);
        }

        public Task<bool> DisableAccessAsync(string username, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("[RADIUS MOCK] DisableAccess: {Username}", username);
            return Task.FromResult(true);
        }

        public Task<bool> DisconnectSessionAsync(string username, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("[RADIUS MOCK] DisconnectSession: {Username}", username);
            return Task.FromResult(true);
        }

        public Task<RadiusUsageStats?> GetUsageStatsAsync(string username, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("[RADIUS MOCK] GetUsageStats: {Username}", username);
            return Task.FromResult<RadiusUsageStats?>(new RadiusUsageStats(0, 0, TimeSpan.Zero));
        }
    }
}
