using AuraConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuraConnect.Infrastructure.Data.Configurations
{
    public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
    {
        public void Configure(EntityTypeBuilder<Tenant> builder)
        {
            builder.ToTable("tenants");

            builder.HasKey(t => t.Id);
            builder.HasIndex(t => t.Slug).IsUnique();

            builder.Property(t => t.Id)
                .HasColumnName("id")
                .HasMaxLength(32);

            builder.Property(t => t.Name)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(t => t.Slug)
                .HasColumnName("slug")
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(t => t.PortalRoutingMode)
                .HasColumnName("portal_routing_mode")
                .HasConversion<int>()
                .HasDefaultValue(PortalRoutingMode.PerSite);

            builder.Property(t => t.SuccessRedirectUrl)
                .HasColumnName("success_redirect_url")
                .HasMaxLength(2048);

            builder.Property(t => t.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(t => t.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.HasMany(t => t.Sites)
                .WithOne(s => s.Tenant)
                .HasForeignKey(s => s.TenantId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
