using AuraConnect.Application.DTOs.Admin;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;
using AuraConnect.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AuraConnect.Infrastructure.Services
{
    public class AdminProfileService : IAdminProfileService
    {
        private readonly IProfileRepository _profileRepository;
        private readonly UserManager<ApplicationUser> _userManager;

        public AdminProfileService(IProfileRepository profileRepository, UserManager<ApplicationUser> userManager)
        {
            _profileRepository = profileRepository;
            _userManager = userManager;
        }

        public async Task<PagedResult<AdminProfileListItem>> GetProfilesAsync(int page, int pageSize, string? tenantId, string? siteId, CancellationToken cancellationToken = default)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var (profiles, total) = await _profileRepository.GetPagedAsync(page, pageSize, tenantId, siteId, cancellationToken);

            var identityIds = profiles.Select(p => p.IdentityUserId).ToList();
            var emailMap = await _userManager.Users
                .Where(u => identityIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Email ?? string.Empty, cancellationToken);

            var items = profiles.Select(p => new AdminProfileListItem
            {
                Id = p.Id,
                FirstName = p.FirstName,
                LastName = p.LastName,
                DisplayName = p.DisplayName,
                Email = emailMap.GetValueOrDefault(p.IdentityUserId, string.Empty),
                PhoneNumber = p.PhoneNumber,
                BlnkWalletId = p.BlnkWalletId,
                Status = p.Status.ToString(),
                CreatedAt = p.CreatedAt,
                SiteIds = p.SiteMemberships.Select(m => m.SiteId).ToList()
            }).ToList();

            return new PagedResult<AdminProfileListItem>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = total
            };
        }

        public async Task<AdminProfileDetail> GetProfileByIdAsync(string profileId, CancellationToken cancellationToken = default)
        {
            var profile = await _profileRepository.GetByIdWithSitesAsync(profileId, cancellationToken)
                ?? throw new InvalidOperationException("Profile not found");

            var user = await _userManager.FindByIdAsync(profile.IdentityUserId);

            return MapToDetail(profile, user?.Email ?? string.Empty);
        }

        public async Task<AdminProfileDetail> UpdateProfileAsync(string profileId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
        {
            var profile = await _profileRepository.GetByIdAsync(profileId, cancellationToken)
                ?? throw new InvalidOperationException("Profile not found");

            if (!string.IsNullOrWhiteSpace(request.FirstName))
                profile.SetFirstName(request.FirstName);

            if (!string.IsNullOrWhiteSpace(request.LastName))
                profile.SetLastName(request.LastName);

            profile.SetPhoneNumber(request.PhoneNumber);

            await _profileRepository.UpdateAsync(profile, cancellationToken);
            await _profileRepository.SaveChangesAsync(cancellationToken);

            return await GetProfileByIdAsync(profileId, cancellationToken);
        }

        public async Task<AdminProfileDetail> UpdateWalletIdsAsync(string profileId, UpdateWalletIdsRequest request, CancellationToken cancellationToken = default)
        {
            var profile = await _profileRepository.GetByIdAsync(profileId, cancellationToken)
                ?? throw new InvalidOperationException("Profile not found");

            profile.SetBlnkIdentityId(request.BlnkIdentityId);
            profile.SetBlnkWalletId(request.BlnkWalletId);

            await _profileRepository.UpdateAsync(profile, cancellationToken);
            await _profileRepository.SaveChangesAsync(cancellationToken);

            return await GetProfileByIdAsync(profileId, cancellationToken);
        }

        public async Task<AdminProfileDetail> SetStatusAsync(string profileId, string status, CancellationToken cancellationToken = default)
        {
            var profile = await _profileRepository.GetByIdAsync(profileId, cancellationToken)
                ?? throw new InvalidOperationException("Profile not found");

            if (status.Equals("Active", StringComparison.OrdinalIgnoreCase))
                profile.Activate();
            else if (status.Equals("Suspended", StringComparison.OrdinalIgnoreCase))
                profile.Suspend();
            else
                throw new ArgumentException($"Invalid status '{status}'. Must be Active or Suspended");

            await _profileRepository.UpdateAsync(profile, cancellationToken);
            await _profileRepository.SaveChangesAsync(cancellationToken);

            return await GetProfileByIdAsync(profileId, cancellationToken);
        }

        private static AdminProfileDetail MapToDetail(Profile profile, string email) => new()
        {
            Id = profile.Id,
            FirstName = profile.FirstName,
            LastName = profile.LastName,
            DisplayName = profile.DisplayName,
            Email = email,
            PhoneNumber = profile.PhoneNumber,
            BlnkIdentityId = profile.BlnkIdentityId,
            BlnkWalletId = profile.BlnkWalletId,
            Status = profile.Status.ToString(),
            CreatedAt = profile.CreatedAt,
            UpdatedAt = profile.UpdatedAt,
            Memberships = profile.SiteMemberships.Select(m => new AdminMembershipSummary
            {
                SiteId = m.SiteId,
                SiteName = m.Site?.Name ?? string.Empty,
                TenantId = m.TenantId,
                FirstVisitAt = m.FirstVisitAt,
                LastVisitAt = m.LastVisitAt
            }).ToList()
        };
    }
}
