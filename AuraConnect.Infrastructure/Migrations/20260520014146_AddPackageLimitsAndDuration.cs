using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuraConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPackageLimitsAndDuration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "rd_password",
                table: "user_packages",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "rd_user_id",
                table: "user_packages",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "rd_username",
                table: "user_packages",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "data_amount",
                table: "packages",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "data_cap",
                table: "packages",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "data_limit_enabled",
                table: "packages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "data_reset",
                table: "packages",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "data_unit",
                table: "packages",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "duration_days",
                table: "packages",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "session_limit",
                table: "packages",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "session_limit_enabled",
                table: "packages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "speed_download_amount",
                table: "packages",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "speed_download_unit",
                table: "packages",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "speed_limit_enabled",
                table: "packages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "speed_upload_amount",
                table: "packages",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "speed_upload_unit",
                table: "packages",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "time_amount",
                table: "packages",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "time_cap",
                table: "packages",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "time_limit_enabled",
                table: "packages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "time_reset",
                table: "packages",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "time_unit",
                table: "packages",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "rd_password",
                table: "user_packages");

            migrationBuilder.DropColumn(
                name: "rd_user_id",
                table: "user_packages");

            migrationBuilder.DropColumn(
                name: "rd_username",
                table: "user_packages");

            migrationBuilder.DropColumn(
                name: "data_amount",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "data_cap",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "data_limit_enabled",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "data_reset",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "data_unit",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "duration_days",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "session_limit",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "session_limit_enabled",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "speed_download_amount",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "speed_download_unit",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "speed_limit_enabled",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "speed_upload_amount",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "speed_upload_unit",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "time_amount",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "time_cap",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "time_limit_enabled",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "time_reset",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "time_unit",
                table: "packages");
        }
    }
}
