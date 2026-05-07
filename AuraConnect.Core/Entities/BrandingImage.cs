namespace AuraConnect.Core.Entities
{
    public class BrandingImage
    {
        public int Id { get; private set; }
        public string SiteId { get; private set; } = string.Empty;
        public BrandingImageType ImageType { get; private set; }
        public byte[] Data { get; private set; } = [];
        public string ContentType { get; private set; } = string.Empty;
        public string FileName { get; private set; } = string.Empty;
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        public virtual Site Site { get; private set; } = null!;

        private BrandingImage() { }

        public BrandingImage(string siteId, BrandingImageType imageType, byte[] data, string contentType, string fileName)
        {
            SiteId = siteId;
            ImageType = imageType;
            Data = data;
            ContentType = contentType;
            FileName = fileName;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateData(byte[] data, string contentType, string fileName)
        {
            Data = data;
            ContentType = contentType;
            FileName = fileName;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
