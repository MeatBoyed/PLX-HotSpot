using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuraConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovePackageRadiusIds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "radius_cloud_id",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "radius_realm_id",
                table: "packages");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "radius_cloud_id",
                table: "packages",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "radius_realm_id",
                table: "packages",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);
        }
    }
}
