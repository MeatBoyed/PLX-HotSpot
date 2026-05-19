using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuraConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveBlnkAddBalance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "blnk_transaction_id",
                table: "wallet_transactions");

            migrationBuilder.DropColumn(
                name: "blnk_identity_id",
                table: "profiles");

            migrationBuilder.DropColumn(
                name: "blnk_wallet_id",
                table: "profiles");

            migrationBuilder.DropColumn(
                name: "blnk_holding_balance_id",
                table: "platform_settings");

            migrationBuilder.DropColumn(
                name: "blnk_ledger_id",
                table: "platform_settings");

            migrationBuilder.AddColumn<decimal>(
                name: "balance",
                table: "profiles",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "balance",
                table: "profiles");

            migrationBuilder.AddColumn<string>(
                name: "blnk_transaction_id",
                table: "wallet_transactions",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "blnk_identity_id",
                table: "profiles",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "blnk_wallet_id",
                table: "profiles",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "blnk_holding_balance_id",
                table: "platform_settings",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "blnk_ledger_id",
                table: "platform_settings",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);
        }
    }
}
