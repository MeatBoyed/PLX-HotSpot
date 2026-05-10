using AuraConnect.Application.DTOs.Auth;
using System.Security.Claims;

namespace AuraConnect.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
        Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
        Task<AuthResponse> GetCurrentUserAsync(ClaimsPrincipal principal, CancellationToken cancellationToken = default);
    }
}
