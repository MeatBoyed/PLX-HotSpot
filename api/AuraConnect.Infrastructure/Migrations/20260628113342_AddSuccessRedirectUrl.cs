using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuraConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSuccessRedirectUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "success_redirect_url",
                table: "tenants",
                type: "character varying(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "success_redirect_url",
                table: "sites",
                type: "character varying(2048)",
                maxLength: 2048,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "success_redirect_url",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "success_redirect_url",
                table: "sites");
        }
    }
}
