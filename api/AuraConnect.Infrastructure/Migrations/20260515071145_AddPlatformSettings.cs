using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuraConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPlatformSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "platform_settings",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    blnk_ledger_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    blnk_holding_balance_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    payfast_merchant_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    payfast_merchant_key = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    payfast_pass_phrase = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    payfast_sandbox_mode = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_platform_settings", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "platform_settings");
        }
    }
}
