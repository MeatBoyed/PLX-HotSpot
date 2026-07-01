using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuraConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRemainingEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ads_config",
                columns: table => new
                {
                    site_id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    revive_server_url = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    revive_zone_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    revive_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    vast_url = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    is_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ads_config", x => x.site_id);
                    table.ForeignKey(
                        name: "FK_ads_config_sites_site_id",
                        column: x => x.site_id,
                        principalTable: "sites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "branding",
                columns: table => new
                {
                    site_id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    brand_primary = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    brand_primary_hover = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    brand_secondary = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    brand_accent = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    text_primary = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    text_secondary = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    text_tertiary = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    text_muted = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    surface_card = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    surface_white = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    surface_border = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    button_primary = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    button_primary_hover = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    button_primary_text = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    button_secondary = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    button_secondary_hover = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    button_secondary_text = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    logo_url = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    logo_white_url = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    connect_card_bg_url = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    banner_overlay_url = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    favicon_url = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    splash_bg_url = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    heading = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    subheading = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    button_text = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    terms_links = table.Column<string>(type: "text", nullable: true),
                    venue_label = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    venue_route = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_branding", x => x.site_id);
                    table.ForeignKey(
                        name: "FK_branding_sites_site_id",
                        column: x => x.site_id,
                        principalTable: "sites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "marketing_submissions",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    site_id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    agreed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    mac_address = table.Column<string>(type: "character varying(17)", maxLength: 17, nullable: true),
                    unsubscribed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    unsubscribed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_marketing_submissions", x => x.id);
                    table.ForeignKey(
                        name: "FK_marketing_submissions_sites_site_id",
                        column: x => x.site_id,
                        principalTable: "sites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "otp_verifications",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    site_id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    msisdn = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    otp_code = table.Column<string>(type: "character varying(6)", maxLength: 6, nullable: false),
                    attempts = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    verified = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    mac_address = table.Column<string>(type: "character varying(17)", maxLength: 17, nullable: true),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    verified_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_otp_verifications", x => x.id);
                    table.ForeignKey(
                        name: "FK_otp_verifications_sites_site_id",
                        column: x => x.site_id,
                        principalTable: "sites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "packages",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    site_id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    price = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    radius_profile = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    radius_realm_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    radius_cloud_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    radius_profile_id = table.Column<int>(type: "integer", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_packages", x => x.id);
                    table.ForeignKey(
                        name: "FK_packages_sites_site_id",
                        column: x => x.site_id,
                        principalTable: "sites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "radius_config",
                columns: table => new
                {
                    site_id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    host = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    port = table.Column<int>(type: "integer", nullable: false, defaultValue: 1812),
                    secret = table.Column<string>(type: "text", nullable: false),
                    nas_identifier = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    realm = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    acct_port = table.Column<int>(type: "integer", nullable: true, defaultValue: 1813),
                    timeout_ms = table.Column<int>(type: "integer", nullable: true, defaultValue: 5000),
                    retries = table.Column<int>(type: "integer", nullable: true, defaultValue: 3),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_radius_config", x => x.site_id);
                    table.ForeignKey(
                        name: "FK_radius_config_sites_site_id",
                        column: x => x.site_id,
                        principalTable: "sites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_marketing_submissions_site_id_email",
                table: "marketing_submissions",
                columns: new[] { "site_id", "email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_marketing_submissions_site_id_unsubscribed",
                table: "marketing_submissions",
                columns: new[] { "site_id", "unsubscribed" });

            migrationBuilder.CreateIndex(
                name: "IX_otp_verifications_expires_at",
                table: "otp_verifications",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "IX_otp_verifications_site_id_msisdn_verified",
                table: "otp_verifications",
                columns: new[] { "site_id", "msisdn", "verified" });

            migrationBuilder.CreateIndex(
                name: "IX_packages_site_id_name",
                table: "packages",
                columns: new[] { "site_id", "name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ads_config");

            migrationBuilder.DropTable(
                name: "branding");

            migrationBuilder.DropTable(
                name: "marketing_submissions");

            migrationBuilder.DropTable(
                name: "otp_verifications");

            migrationBuilder.DropTable(
                name: "packages");

            migrationBuilder.DropTable(
                name: "radius_config");
        }
    }
}
