using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuraConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPayFastIpnFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "amount_fee",
                table: "wallet_transactions",
                type: "numeric(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "amount_net",
                table: "wallet_transactions",
                type: "numeric(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "payfast_payment_id",
                table: "wallet_transactions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "amount_fee",
                table: "wallet_transactions");

            migrationBuilder.DropColumn(
                name: "amount_net",
                table: "wallet_transactions");

            migrationBuilder.DropColumn(
                name: "payfast_payment_id",
                table: "wallet_transactions");
        }
    }
}
