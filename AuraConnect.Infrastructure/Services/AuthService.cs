using AuraConnect.Application.DTOs.Auth;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AuraConnect.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IProfileRepository _profileRepository;
        private readonly ISiteMembershipRepository _membershipRepository;
        private readonly ISiteRepository _siteRepository;
        private readonly IWalletService _walletService;
        private readonly string _jwtSecret;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;
        private readonly int _jwtExpiryDays;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            IProfileRepository profileRepository,
            ISiteMembershipRepository membershipRepository,
            ISiteRepository siteRepository,
            IWalletService walletService,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _profileRepository = profileRepository;
            _membershipRepository = membershipRepository;
            _siteRepository = siteRepository;
            _walletService = walletService;
            _jwtSecret = configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret is not configured");
            _jwtIssuer = configuration["Jwt:Issuer"] ?? "AuraConnect";
            _jwtAudience = configuration["Jwt:Audience"] ?? "AuraConnect";
            _jwtExpiryDays = int.TryParse(configuration["Jwt:ExpiryDays"], out var days) ? days : 7;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
        {
            var existing = await _userManager.FindByEmailAsync(request.Email);
            if (existing != null)
                throw new InvalidOperationException("An account with this email address already exists");

            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

            await _userManager.AddToRoleAsync(user, "User");

            var profile = new Profile(user.Id, request.FirstName, request.LastName, request.PhoneNumber);
            await _profileRepository.AddAsync(profile, cancellationToken);
            await _profileRepository.SaveChangesAsync(cancellationToken);

            await _walletService.InitializeWalletAsync(profile, cancellationToken);

            if (!string.IsNullOrWhiteSpace(request.TenantId) && !string.IsNullOrWhiteSpace(request.Ssid))
                await CreateOrUpdateMembershipAsync(profile.Id, request.TenantId, request.Ssid, cancellationToken);

            return await BuildResponseAsync(user, profile, cancellationToken);
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                throw new UnauthorizedAccessException("Invalid email or password");

            if (await _userManager.IsLockedOutAsync(user))
                throw new InvalidOperationException("Account is temporarily locked. Please try again later");

            var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!passwordValid)
            {
                await _userManager.AccessFailedAsync(user);
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            await _userManager.ResetAccessFailedCountAsync(user);

            var profile = await _profileRepository.GetByIdentityUserIdAsync(user.Id, cancellationToken)
                ?? throw new InvalidOperationException("Profile not found");

            if (!string.IsNullOrWhiteSpace(request.TenantId) && !string.IsNullOrWhiteSpace(request.Ssid))
                await CreateOrUpdateMembershipAsync(profile.Id, request.TenantId, request.Ssid, cancellationToken);

            return await BuildResponseAsync(user, profile, cancellationToken);
        }

        public async Task<AuthResponse> GetCurrentUserAsync(ClaimsPrincipal principal, CancellationToken cancellationToken = default)
        {
            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new InvalidOperationException("User not found");

            var user = await _userManager.FindByIdAsync(userId)
                ?? throw new InvalidOperationException("User not found");

            var profile = await _profileRepository.GetByIdentityUserIdAsync(user.Id, cancellationToken)
                ?? throw new InvalidOperationException("Profile not found");

            return await BuildResponseAsync(user, profile, cancellationToken);
        }

        private async Task CreateOrUpdateMembershipAsync(string profileId, string tenantId, string ssid, CancellationToken cancellationToken)
        {
            var site = await _siteRepository.GetBySsidAsync(ssid, cancellationToken);
            if (site == null || site.TenantId != tenantId) return;

            await _membershipRepository.UpsertAsync(profileId, site.Id, tenantId, cancellationToken);
            await _membershipRepository.SaveChangesAsync(cancellationToken);
        }

        private async Task<AuthResponse> BuildResponseAsync(ApplicationUser user, Profile profile, CancellationToken cancellationToken)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var siteIds = await _membershipRepository.GetSiteIdsByProfileAsync(profile.Id, cancellationToken);
            var expiry = DateTime.UtcNow.AddDays(_jwtExpiryDays);
            var token = GenerateJwtToken(user, roles, profile, expiry);

            return new AuthResponse
            {
                Token = token,
                ExpiresAt = expiry,
                ProfileId = profile.Id,
                Email = user.Email!,
                FirstName = profile.FirstName,
                LastName = profile.LastName,
                DisplayName = profile.DisplayName,
                PhoneNumber = profile.PhoneNumber,
                BlnkWalletId = profile.BlnkWalletId,
                Status = profile.Status.ToString(),
                Roles = [.. roles],
                SiteIds = [.. siteIds]
            };
        }

        private string GenerateJwtToken(ApplicationUser user, IList<string> roles, Profile profile, DateTime expiry)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id),
                new(JwtRegisteredClaimNames.Email, user.Email!),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(ClaimTypes.NameIdentifier, user.Id),
                new("profileId", profile.Id),
            };

            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));

            var token = new JwtSecurityToken(
                issuer: _jwtIssuer,
                audience: _jwtAudience,
                claims: claims,
                expires: expiry,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
