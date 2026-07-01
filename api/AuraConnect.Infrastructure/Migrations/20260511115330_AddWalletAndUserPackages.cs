using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuraConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWalletAndUserPackages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "blnk_identity_id",
                table: "profiles",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "user_packages",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    profile_id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    package_id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    site_id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    blnk_transaction_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    purchased_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_packages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_packages_packages_package_id",
                        column: x => x.package_id,
                        principalTable: "packages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_packages_profiles_profile_id",
                        column: x => x.profile_id,
                        principalTable: "profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_packages_sites_site_id",
                        column: x => x.site_id,
                        principalTable: "sites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wallet_transactions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    profile_id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    blnk_transaction_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    type = table.Column<int>(type: "integer", nullable: false),
                    amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    reference = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wallet_transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wallet_transactions_profiles_profile_id",
                        column: x => x.profile_id,
                        principalTable: "profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_user_packages_package_id",
                table: "user_packages",
                column: "package_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_packages_profile_id",
                table: "user_packages",
                column: "profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_packages_profile_site",
                table: "user_packages",
                columns: new[] { "profile_id", "site_id" });

            migrationBuilder.CreateIndex(
                name: "IX_user_packages_site_id",
                table: "user_packages",
                column: "site_id");

            migrationBuilder.CreateIndex(
                name: "ix_wallet_transactions_profile_id",
                table: "wallet_transactions",
                column: "profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_wallet_transactions_reference",
                table: "wallet_transactions",
                column: "reference",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_packages");

            migrationBuilder.DropTable(
                name: "wallet_transactions");

            migrationBuilder.DropColumn(
                name: "blnk_identity_id",
                table: "profiles");
        }
    }
}
