using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuraConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGatewaySessionEventsAndPortalRoutingMode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "portal_routing_mode",
                table: "tenants",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "gateway_session_events",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    site_id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    mac = table.Column<string>(type: "character varying(17)", maxLength: 17, nullable: true),
                    nas_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    link_login_only = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    link_status = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    link_logout = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    resolved_host = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    redirect_url = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    login_outcome = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    login_error = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    login_error_original = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    login_completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gateway_session_events", x => x.id);
                    table.ForeignKey(
                        name: "FK_gateway_session_events_sites_site_id",
                        column: x => x.site_id,
                        principalTable: "sites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_gateway_session_events_mac_created_at",
                table: "gateway_session_events",
                columns: new[] { "mac", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_gateway_session_events_site_id",
                table: "gateway_session_events",
                column: "site_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "gateway_session_events");

            migrationBuilder.DropColumn(
                name: "portal_routing_mode",
                table: "tenants");
        }
    }
}
