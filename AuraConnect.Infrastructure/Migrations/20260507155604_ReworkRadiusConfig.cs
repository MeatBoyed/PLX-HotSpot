using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuraConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReworkRadiusConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "acct_port",
                table: "radius_config");

            migrationBuilder.DropColumn(
                name: "host",
                table: "radius_config");

            migrationBuilder.DropColumn(
                name: "port",
                table: "radius_config");

            migrationBuilder.DropColumn(
                name: "retries",
                table: "radius_config");

            migrationBuilder.DropColumn(
                name: "secret",
                table: "radius_config");

            migrationBuilder.DropColumn(
                name: "timeout_ms",
                table: "radius_config");

            migrationBuilder.RenameColumn(
                name: "realm",
                table: "radius_config",
                newName: "radiusdesk_realm_id");

            migrationBuilder.RenameColumn(
                name: "nas_identifier",
                table: "radius_config",
                newName: "radiusdesk_cloud_id");

            migrationBuilder.AddColumn<string>(
                name: "free_password",
                table: "radius_config",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "free_username",
                table: "radius_config",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gateway_url",
                table: "radius_config",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "radiusdesk_api_token",
                table: "radius_config",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "radiusdesk_url",
                table: "radius_config",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "free_password",
                table: "radius_config");

            migrationBuilder.DropColumn(
                name: "free_username",
                table: "radius_config");

            migrationBuilder.DropColumn(
                name: "gateway_url",
                table: "radius_config");

            migrationBuilder.DropColumn(
                name: "radiusdesk_api_token",
                table: "radius_config");

            migrationBuilder.DropColumn(
                name: "radiusdesk_url",
                table: "radius_config");

            migrationBuilder.RenameColumn(
                name: "radiusdesk_realm_id",
                table: "radius_config",
                newName: "realm");

            migrationBuilder.RenameColumn(
                name: "radiusdesk_cloud_id",
                table: "radius_config",
                newName: "nas_identifier");

            migrationBuilder.AddColumn<int>(
                name: "acct_port",
                table: "radius_config",
                type: "integer",
                nullable: true,
                defaultValue: 1813);

            migrationBuilder.AddColumn<string>(
                name: "host",
                table: "radius_config",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "port",
                table: "radius_config",
                type: "integer",
                nullable: false,
                defaultValue: 1812);

            migrationBuilder.AddColumn<int>(
                name: "retries",
                table: "radius_config",
                type: "integer",
                nullable: true,
                defaultValue: 3);

            migrationBuilder.AddColumn<string>(
                name: "secret",
                table: "radius_config",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "timeout_ms",
                table: "radius_config",
                type: "integer",
                nullable: true,
                defaultValue: 5000);
        }
    }
}
