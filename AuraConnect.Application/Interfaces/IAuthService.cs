using AuraConnect.Application.DTOs.Auth;
using AuraConnect.Application.DTOs.Portal;
using System.Security.Claims;

namespace AuraConnect.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
        Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
        Task<AuthResponse> GetCurrentUserAsync(ClaimsPrincipal principal, CancellationToken cancellationToken = default);
        Task<MeResponse> GetMeAsync(ClaimsPrincipal principal, CancellationToken cancellationToken = default);
        Task<MeResponse> UpdateMeAsync(ClaimsPrincipal principal, UpdateMeRequest request, CancellationToken cancellationToken = default);
    }
}
