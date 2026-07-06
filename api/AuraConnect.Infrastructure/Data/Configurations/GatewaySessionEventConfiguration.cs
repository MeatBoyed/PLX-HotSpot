using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AuraConnect.Infrastructure.Data.Configurations
{
    public class GatewaySessionEventConfiguration : IEntityTypeConfiguration<GatewaySessionEvent>
    {
        public void Configure(EntityTypeBuilder<GatewaySessionEvent> builder)
        {
            builder.ToTable("gateway_session_events");

            builder.HasKey(g => g.Id);
            builder.HasIndex(g => new { g.Mac, g.CreatedAt });
            builder.HasIndex(g => g.SiteId);

            builder.Property(g => g.Id)
                .HasColumnName("id")
                .HasMaxLength(32);

            builder.Property(g => g.SiteId)
                .HasColumnName("site_id")
                .IsRequired()
                .HasMaxLength(32);

            builder.Property(g => g.Mac)
                .HasColumnName("mac")
                .HasMaxLength(64);

            builder.Property(g => g.NasId)
                .HasColumnName("nas_id")
                .HasMaxLength(255);

            builder.Property(g => g.LinkLoginOnly)
                .HasColumnName("link_login_only")
                .HasMaxLength(2048);

            builder.Property(g => g.LinkStatus)
                .HasColumnName("link_status")
                .HasMaxLength(2048);

            builder.Property(g => g.LinkLogout)
                .HasColumnName("link_logout")
                .HasMaxLength(2048);

            builder.Property(g => g.ResolvedHost)
                .HasColumnName("resolved_host")
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(g => g.RedirectUrl)
                .HasColumnName("redirect_url")
                .IsRequired()
                .HasMaxLength(2048);

            builder.Property(g => g.LoginOutcome)
                .HasColumnName("login_outcome")
                .HasConversion<int>()
                .HasDefaultValue(GatewayLoginOutcome.Pending);

            builder.Property(g => g.LoginError)
                .HasColumnName("login_error")
                .HasMaxLength(512);

            builder.Property(g => g.LoginErrorOriginal)
                .HasColumnName("login_error_original")
                .HasMaxLength(512);

            builder.Property(g => g.LoginCompletedAt)
                .HasColumnName("login_completed_at");

            builder.Property(g => g.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(g => g.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.HasOne(g => g.Site)
                .WithMany()
                .HasForeignKey(g => g.SiteId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
