using AuraConnect.Application.DTOs.Branding;
using AuraConnect.Application.DTOs.Portal;
using AuraConnect.Application.Interfaces;
using AuraConnect.Core.Entities;
using AuraConnect.Core.Interfaces.Repositories;

namespace AuraConnect.Application.Services
{
    public class BrandingService : IBrandingService
    {
        private readonly IBrandingRepository _brandingRepository;
        private readonly ISiteRepository _siteRepository;

        public BrandingService(IBrandingRepository brandingRepository, ISiteRepository siteRepository)
        {
            _brandingRepository = brandingRepository;
            _siteRepository = siteRepository;
        }

        // GET branding
        public async Task<BrandingResponse?> GetBrandingAsync(string siteId, CancellationToken cancellationToken = default)
        {
            // 1. Verify site exists
            var site = await _siteRepository.GetByIdAsync(siteId, cancellationToken);
            if (site == null)
                throw new InvalidOperationException($"Site with ID '{siteId}' not found");

            // 2. Get branding (or return default if doesn't exist)
            var branding = await _brandingRepository.GetBySiteIdAsync(siteId, cancellationToken);

            if (branding == null)
                return null;  // No branding configured yet

            return MapToResponse(branding);
        }

        // PUT full branding update (creates if not exists)
        public async Task<BrandingResponse> UpdateBrandingAsync(string siteId, UpdateBrandingRequest request, CancellationToken cancellationToken = default)
        {
            // 1. Verify site exists
            var site = await _siteRepository.GetByIdAsync(siteId, cancellationToken);
            if (site == null)
                throw new InvalidOperationException($"Site with ID '{siteId}' not found");

            // 2. Get existing or create new branding
            var branding = await _brandingRepository.GetBySiteIdAsync(siteId, cancellationToken);
            var isNew = branding == null;

            if (isNew)
            {
                branding = new Branding(siteId);
            }

            // 3. Apply all updates (only non-null values)
            ApplyColorUpdates(branding, request);
            ApplyImageUpdates(branding, request);
            ApplyContentUpdates(branding, request);

            // 4. Save
            if (isNew)
                await _brandingRepository.AddAsync(branding, cancellationToken);
            else
                await _brandingRepository.UpdateAsync(branding, cancellationToken);

            await _brandingRepository.SaveChangesAsync(cancellationToken);

            return MapToResponse(branding);
        }

        // PUT update only colors
        public async Task<BrandingResponse> UpdateColorsAsync(string siteId, UpdateColorsRequest request, CancellationToken cancellationToken = default)
        {
            var branding = await GetOrCreateBrandingAsync(siteId, cancellationToken);

            // Apply color updates
            if (request.BrandPrimary != null) branding.SetBrandPrimary(request.BrandPrimary);
            if (request.BrandPrimaryHover != null) branding.SetBrandPrimaryHover(request.BrandPrimaryHover);
            if (request.BrandSecondary != null) branding.SetBrandSecondary(request.BrandSecondary);
            if (request.BrandAccent != null) branding.SetBrandAccent(request.BrandAccent);
            if (request.TextPrimary != null) branding.SetTextPrimary(request.TextPrimary);
            if (request.TextSecondary != null) branding.SetTextSecondary(request.TextSecondary);
            if (request.TextTertiary != null) branding.SetTextTertiary(request.TextTertiary);
            if (request.TextMuted != null) branding.SetTextMuted(request.TextMuted);
            if (request.SurfaceCard != null) branding.SetSurfaceCard(request.SurfaceCard);
            if (request.SurfaceWhite != null) branding.SetSurfaceWhite(request.SurfaceWhite);
            if (request.SurfaceBorder != null) branding.SetSurfaceBorder(request.SurfaceBorder);
            if (request.ButtonPrimary != null) branding.SetButtonPrimary(request.ButtonPrimary);
            if (request.ButtonPrimaryHover != null) branding.SetButtonPrimaryHover(request.ButtonPrimaryHover);
            if (request.ButtonPrimaryText != null) branding.SetButtonPrimaryText(request.ButtonPrimaryText);
            if (request.ButtonSecondary != null) branding.SetButtonSecondary(request.ButtonSecondary);
            if (request.ButtonSecondaryHover != null) branding.SetButtonSecondaryHover(request.ButtonSecondaryHover);
            if (request.ButtonSecondaryText != null) branding.SetButtonSecondaryText(request.ButtonSecondaryText);

            await _brandingRepository.SaveChangesAsync(cancellationToken);

            return MapToResponse(branding);
        }

        // PUT update only images
        public async Task<BrandingResponse> UpdateImagesAsync(string siteId, UpdateImagesRequest request, CancellationToken cancellationToken = default)
        {
            var branding = await GetOrCreateBrandingAsync(siteId, cancellationToken);

            if (request.LogoUrl != null) branding.SetLogoUrl(request.LogoUrl);
            if (request.LogoWhiteUrl != null) branding.SetLogoWhiteUrl(request.LogoWhiteUrl);
            if (request.ConnectCardBgUrl != null) branding.SetConnectCardBgUrl(request.ConnectCardBgUrl);
            if (request.BannerOverlayUrl != null) branding.SetBannerOverlayUrl(request.BannerOverlayUrl);
            if (request.FaviconUrl != null) branding.SetFaviconUrl(request.FaviconUrl);
            if (request.SplashBgUrl != null) branding.SetSplashBgUrl(request.SplashBgUrl);

            await _brandingRepository.SaveChangesAsync(cancellationToken);

            return MapToResponse(branding);
        }

        // PUT update only content
        public async Task<BrandingResponse> UpdateContentAsync(string siteId, UpdateContentRequest request, CancellationToken cancellationToken = default)
        {
            var branding = await GetOrCreateBrandingAsync(siteId, cancellationToken);

            if (request.DisplayName != null) branding.SetDisplayName(request.DisplayName);
            if (request.Heading != null) branding.SetHeading(request.Heading);
            if (request.Subheading != null) branding.SetSubheading(request.Subheading);
            if (request.SplashHeading != null) branding.SetSplashHeading(request.SplashHeading);
            if (request.ButtonText != null) branding.SetButtonText(request.ButtonText);
            if (request.TermsLinks != null) branding.SetTermsLinks(request.TermsLinks);
            if (request.VenueLabel != null) branding.SetVenueLabel(request.VenueLabel);
            if (request.VenueRoute != null) branding.SetVenueRoute(request.VenueRoute);
            if (request.SortOrder.HasValue) branding.SetSortOrder(request.SortOrder.Value);

            await _brandingRepository.SaveChangesAsync(cancellationToken);

            return MapToResponse(branding);
        }

        // POST upload image — stores bytes in DB and updates the branding URL field
        public async Task<BrandingResponse> UploadImageAsync(string siteId, BrandingImageType imageType, Stream data, string fileName, string contentType, CancellationToken cancellationToken = default)
        {
            var branding = await GetOrCreateBrandingAsync(siteId, cancellationToken);

            using var ms = new MemoryStream();
            await data.CopyToAsync(ms, cancellationToken);
            var bytes = ms.ToArray();

            var image = new BrandingImage(siteId, imageType, bytes, contentType, fileName);
            await _brandingRepository.SaveImageAsync(image, cancellationToken);

            var url = $"/api/sites/{siteId}/branding/images/{imageType}";
            SetBrandingImageUrl(branding, imageType, url);

            await _brandingRepository.SaveChangesAsync(cancellationToken);

            return MapToResponse(branding);
        }

        // GET portal branding by SSID — combines Site + Branding into a single response
        public async Task<PortalBrandingResponse> GetPortalBrandingAsync(string ssid, CancellationToken cancellationToken = default)
        {
            var site = await _siteRepository.GetBySsidWithBrandingAsync(ssid, cancellationToken);
            if (site == null)
                throw new InvalidOperationException($"No site found for SSID '{ssid}'");

            if (site.Branding == null)
                throw new InvalidOperationException($"No branding configured for SSID '{ssid}'");

            return MapToPortalResponse(site, site.Branding);
        }

        // GET raw image data for serving to clients
        public async Task<BrandingImageData?> GetImageAsync(string siteId, BrandingImageType imageType, CancellationToken cancellationToken = default)
        {
            var image = await _brandingRepository.GetImageAsync(siteId, imageType, cancellationToken);
            if (image == null) return null;
            return new BrandingImageData(image.Data, image.ContentType, image.FileName);
        }

        // Helper: Get or create branding (with site validation)
        private async Task<Branding> GetOrCreateBrandingAsync(string siteId, CancellationToken cancellationToken)
        {
            // Verify site exists
            var site = await _siteRepository.GetByIdAsync(siteId, cancellationToken);
            if (site == null)
                throw new InvalidOperationException($"Site with ID '{siteId}' not found");

            // Get existing or create new
            var branding = await _brandingRepository.GetBySiteIdAsync(siteId, cancellationToken);
            if (branding == null)
            {
                branding = new Branding(siteId);
                await _brandingRepository.AddAsync(branding, cancellationToken);
            }

            return branding;
        }

        // Helper: Apply color updates from request
        private static void ApplyColorUpdates(Branding branding, UpdateBrandingRequest request)
        {
            if (request.BrandPrimary != null) branding.SetBrandPrimary(request.BrandPrimary);
            if (request.BrandPrimaryHover != null) branding.SetBrandPrimaryHover(request.BrandPrimaryHover);
            if (request.BrandSecondary != null) branding.SetBrandSecondary(request.BrandSecondary);
            if (request.BrandAccent != null) branding.SetBrandAccent(request.BrandAccent);
            if (request.TextPrimary != null) branding.SetTextPrimary(request.TextPrimary);
            if (request.TextSecondary != null) branding.SetTextSecondary(request.TextSecondary);
            if (request.TextTertiary != null) branding.SetTextTertiary(request.TextTertiary);
            if (request.TextMuted != null) branding.SetTextMuted(request.TextMuted);
            if (request.SurfaceCard != null) branding.SetSurfaceCard(request.SurfaceCard);
            if (request.SurfaceWhite != null) branding.SetSurfaceWhite(request.SurfaceWhite);
            if (request.SurfaceBorder != null) branding.SetSurfaceBorder(request.SurfaceBorder);
            if (request.ButtonPrimary != null) branding.SetButtonPrimary(request.ButtonPrimary);
            if (request.ButtonPrimaryHover != null) branding.SetButtonPrimaryHover(request.ButtonPrimaryHover);
            if (request.ButtonPrimaryText != null) branding.SetButtonPrimaryText(request.ButtonPrimaryText);
            if (request.ButtonSecondary != null) branding.SetButtonSecondary(request.ButtonSecondary);
            if (request.ButtonSecondaryHover != null) branding.SetButtonSecondaryHover(request.ButtonSecondaryHover);
            if (request.ButtonSecondaryText != null) branding.SetButtonSecondaryText(request.ButtonSecondaryText);
        }

        // Helper: Apply image updates from request
        private static void ApplyImageUpdates(Branding branding, UpdateBrandingRequest request)
        {
            if (request.LogoUrl != null) branding.SetLogoUrl(request.LogoUrl);
            if (request.LogoWhiteUrl != null) branding.SetLogoWhiteUrl(request.LogoWhiteUrl);
            if (request.ConnectCardBgUrl != null) branding.SetConnectCardBgUrl(request.ConnectCardBgUrl);
            if (request.BannerOverlayUrl != null) branding.SetBannerOverlayUrl(request.BannerOverlayUrl);
            if (request.FaviconUrl != null) branding.SetFaviconUrl(request.FaviconUrl);
            if (request.SplashBgUrl != null) branding.SetSplashBgUrl(request.SplashBgUrl);
        }

        // Helper: Apply content updates from request
        private static void ApplyContentUpdates(Branding branding, UpdateBrandingRequest request)
        {
            if (request.DisplayName != null) branding.SetDisplayName(request.DisplayName);
            if (request.Heading != null) branding.SetHeading(request.Heading);
            if (request.Subheading != null) branding.SetSubheading(request.Subheading);
            if (request.SplashHeading != null) branding.SetSplashHeading(request.SplashHeading);
            if (request.ButtonText != null) branding.SetButtonText(request.ButtonText);
            if (request.TermsLinks != null) branding.SetTermsLinks(request.TermsLinks);
            if (request.VenueLabel != null) branding.SetVenueLabel(request.VenueLabel);
            if (request.VenueRoute != null) branding.SetVenueRoute(request.VenueRoute);
            if (request.SortOrder.HasValue) branding.SetSortOrder(request.SortOrder.Value);
        }

        private static PortalBrandingResponse MapToPortalResponse(Site site, Branding branding)
        {
            return new PortalBrandingResponse
            {
                // Identity
                Ssid = site.Ssid,
                DisplayName = branding.DisplayName,

                // Colors
                BrandPrimary = branding.BrandPrimary,
                BrandPrimaryHover = branding.BrandPrimaryHover,
                BrandSecondary = branding.BrandSecondary,
                BrandAccent = branding.BrandAccent,
                TextPrimary = branding.TextPrimary,
                TextSecondary = branding.TextSecondary,
                TextTertiary = branding.TextTertiary,
                TextMuted = branding.TextMuted,
                SurfaceCard = branding.SurfaceCard,
                SurfaceWhite = branding.SurfaceWhite,
                SurfaceBorder = branding.SurfaceBorder,
                ButtonPrimary = branding.ButtonPrimary,
                ButtonPrimaryHover = branding.ButtonPrimaryHover,
                ButtonPrimaryText = branding.ButtonPrimaryText,
                ButtonSecondary = branding.ButtonSecondary,
                ButtonSecondaryHover = branding.ButtonSecondaryHover,
                ButtonSecondaryText = branding.ButtonSecondaryText,

                // Images
                LogoUrl = branding.LogoUrl,
                LogoWhiteUrl = branding.LogoWhiteUrl,
                ConnectCardBgUrl = branding.ConnectCardBgUrl,
                BannerOverlayUrl = branding.BannerOverlayUrl,
                FaviconUrl = branding.FaviconUrl,
                SplashBgUrl = branding.SplashBgUrl,

                // Content
                Heading = branding.Heading,
                Subheading = branding.Subheading,
                SplashHeading = branding.SplashHeading,
                ButtonText = branding.ButtonText,
                TermsLinks = branding.TermsLinks,

                // Venue
                VenueLabel = branding.VenueLabel,
                VenueRoute = branding.VenueRoute,
                SortOrder = branding.SortOrder,

                // Auth & Features
                AuthMethods = site.AuthMethods,
                MarketingOptIn = site.MarketingOptIn
            };
        }

        private static void SetBrandingImageUrl(Branding branding, BrandingImageType imageType, string url)
        {
            switch (imageType)
            {
                case BrandingImageType.Logo: branding.SetLogoUrl(url); break;
                case BrandingImageType.LogoWhite: branding.SetLogoWhiteUrl(url); break;
                case BrandingImageType.ConnectCardBackground: branding.SetConnectCardBgUrl(url); break;
                case BrandingImageType.BannerOverlay: branding.SetBannerOverlayUrl(url); break;
                case BrandingImageType.Favicon: branding.SetFaviconUrl(url); break;
                case BrandingImageType.SplashBackground: branding.SetSplashBgUrl(url); break;
            }
        }

        // Helper: Map Entity → DTO
        private static BrandingResponse MapToResponse(Branding branding)
        {
            return new BrandingResponse
            {
                // Colors
                BrandPrimary = branding.BrandPrimary,
                BrandPrimaryHover = branding.BrandPrimaryHover,
                BrandSecondary = branding.BrandSecondary,
                BrandAccent = branding.BrandAccent,
                TextPrimary = branding.TextPrimary,
                TextSecondary = branding.TextSecondary,
                TextTertiary = branding.TextTertiary,
                TextMuted = branding.TextMuted,
                SurfaceCard = branding.SurfaceCard,
                SurfaceWhite = branding.SurfaceWhite,
                SurfaceBorder = branding.SurfaceBorder,
                ButtonPrimary = branding.ButtonPrimary,
                ButtonPrimaryHover = branding.ButtonPrimaryHover,
                ButtonPrimaryText = branding.ButtonPrimaryText,
                ButtonSecondary = branding.ButtonSecondary,
                ButtonSecondaryHover = branding.ButtonSecondaryHover,
                ButtonSecondaryText = branding.ButtonSecondaryText,

                // Images
                LogoUrl = branding.LogoUrl,
                LogoWhiteUrl = branding.LogoWhiteUrl,
                ConnectCardBgUrl = branding.ConnectCardBgUrl,
                BannerOverlayUrl = branding.BannerOverlayUrl,
                FaviconUrl = branding.FaviconUrl,
                SplashBgUrl = branding.SplashBgUrl,

                // Content
                DisplayName = branding.DisplayName,
                Heading = branding.Heading,
                Subheading = branding.Subheading,
                SplashHeading = branding.SplashHeading,
                ButtonText = branding.ButtonText,
                TermsLinks = branding.TermsLinks,
                VenueLabel = branding.VenueLabel,
                VenueRoute = branding.VenueRoute,
                SortOrder = branding.SortOrder,

                // Metadata
                CreatedAt = branding.CreatedAt,
                UpdatedAt = branding.UpdatedAt
            };
        }
    }
}
