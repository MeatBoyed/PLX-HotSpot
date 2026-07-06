using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuraConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRadiusCalledStationIdsAndDbSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string[]>(
                name: "radius_called_station_ids",
                table: "sites",
                type: "text[]",
                nullable: false,
                defaultValueSql: "'{}'");

            migrationBuilder.AddColumn<string>(
                name: "radius_db_host",
                table: "platform_settings",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "radius_db_name",
                table: "platform_settings",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "radius_db_password",
                table: "platform_settings",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "radius_db_port",
                table: "platform_settings",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "radius_db_username",
                table: "platform_settings",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "radius_called_station_ids",
                table: "sites");

            migrationBuilder.DropColumn(
                name: "radius_db_host",
                table: "platform_settings");

            migrationBuilder.DropColumn(
                name: "radius_db_name",
                table: "platform_settings");

            migrationBuilder.DropColumn(
                name: "radius_db_password",
                table: "platform_settings");

            migrationBuilder.DropColumn(
                name: "radius_db_port",
                table: "platform_settings");

            migrationBuilder.DropColumn(
                name: "radius_db_username",
                table: "platform_settings");
        }
    }
}
