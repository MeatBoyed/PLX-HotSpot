using AuraConnect.Application.DTOs.Auth;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace AuraConnect.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IProfileRepository _profileRepository;
        private readonly ISiteMembershipRepository _membershipRepository;
        private readonly ISiteRepository _siteRepository;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IProfileRepository profileRepository,
            ISiteMembershipRepository membershipRepository,
            ISiteRepository siteRepository)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _profileRepository = profileRepository;
            _membershipRepository = membershipRepository;
            _siteRepository = siteRepository;
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

            if (!string.IsNullOrWhiteSpace(request.TenantId) && !string.IsNullOrWhiteSpace(request.Ssid))
                await CreateOrUpdateMembershipAsync(profile.Id, request.TenantId, request.Ssid, cancellationToken);

            await _signInManager.SignInAsync(user, isPersistent: false);

            return await BuildResponseAsync(user, profile, cancellationToken);
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                throw new UnauthorizedAccessException("Invalid email or password");

            var result = await _signInManager.PasswordSignInAsync(user, request.Password, request.RememberMe, lockoutOnFailure: true);

            if (!result.Succeeded)
            {
                if (result.IsLockedOut)
                    throw new InvalidOperationException("Account is temporarily locked. Please try again later");
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            var profile = await _profileRepository.GetByIdentityUserIdAsync(user.Id, cancellationToken)
                ?? throw new InvalidOperationException("Profile not found");

            if (!string.IsNullOrWhiteSpace(request.TenantId) && !string.IsNullOrWhiteSpace(request.Ssid))
                await CreateOrUpdateMembershipAsync(profile.Id, request.TenantId, request.Ssid, cancellationToken);

            return await BuildResponseAsync(user, profile, cancellationToken);
        }

        public async Task LogoutAsync(CancellationToken cancellationToken = default) =>
            await _signInManager.SignOutAsync();

        public async Task<AuthResponse> GetCurrentUserAsync(ClaimsPrincipal principal, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.GetUserAsync(principal)
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

            return new AuthResponse
            {
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
    }
}
