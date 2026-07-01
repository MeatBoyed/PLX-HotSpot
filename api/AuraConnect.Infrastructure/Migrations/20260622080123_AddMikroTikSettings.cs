using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuraConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMikroTikSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "mikrotik_api_host",
                table: "platform_settings",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "mikrotik_password",
                table: "platform_settings",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "mikrotik_username",
                table: "platform_settings",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "mikrotik_api_host",
                table: "platform_settings");

            migrationBuilder.DropColumn(
                name: "mikrotik_password",
                table: "platform_settings");

            migrationBuilder.DropColumn(
                name: "mikrotik_username",
                table: "platform_settings");
        }
    }
}
