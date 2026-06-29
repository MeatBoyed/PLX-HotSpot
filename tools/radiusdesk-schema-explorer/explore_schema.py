#!/usr/bin/env python3
"""
Connects to the RadiusDesk MariaDB instance (read-only) and dumps a full schema
report: every table, its DESCRIBE output, row count, and — for the accounting
tables we actually care about — the date range currently retained.

Usage:
    cp .env.example .env   # fill in connection details
    pip install -r requirements.txt
    python3 explore_schema.py
"""
import os
from datetime import datetime

import pymysql
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("RD_DB_HOST")
DB_PORT = int(os.getenv("RD_DB_PORT", "3306"))
DB_NAME = os.getenv("RD_DB_NAME", "rd")
DB_USER = os.getenv("RD_DB_USER")
DB_PASSWORD = os.getenv("RD_DB_PASSWORD")

# Tables whose retention window is worth knowing precisely — extend if others matter.
DATE_RANGE_COLUMNS = {
    "radacct": "acctstarttime",
    "radacct_history": "acctstarttime",
    "radpostauth": "authdate",
}

REPORT_DIR = os.getenv("REPORT_DIR", "reports")


def connect():
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
        connect_timeout=10,
    )


def describe_table(cursor, table):
    cursor.execute(f"DESCRIBE `{table}`")
    return cursor.fetchall()


def row_count(cursor, table):
    try:
        cursor.execute(f"SELECT COUNT(*) AS c FROM `{table}`")
        return cursor.fetchone()["c"]
    except pymysql.Error as e:
        return f"error: {e}"


def date_range(cursor, table, column):
    try:
        cursor.execute(f"SELECT MIN(`{column}`) AS min_d, MAX(`{column}`) AS max_d FROM `{table}`")
        row = cursor.fetchone()
        return row["min_d"], row["max_d"]
    except pymysql.Error as e:
        return None, f"error: {e}"


def main():
    missing = [name for name, val in [("RD_DB_HOST", DB_HOST), ("RD_DB_USER", DB_USER), ("RD_DB_PASSWORD", DB_PASSWORD)] if not val]
    if missing:
        raise SystemExit(f"Missing required .env values: {', '.join(missing)}")

    os.makedirs(REPORT_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
    report_path = os.path.join(REPORT_DIR, f"rd_schema_{timestamp}.md")

    conn = connect()
    lines = [f"# RadiusDesk DB schema report — {DB_NAME}@{DB_HOST}", f"Generated {datetime.now().isoformat()}", ""]

    try:
        with conn.cursor() as cursor:
            cursor.execute("SHOW TABLES")
            tables = sorted(row[f"Tables_in_{DB_NAME}"] for row in cursor.fetchall())
            lines.append(f"**{len(tables)} tables found**\n")

            for i, table in enumerate(tables, 1):
                print(f"[{i}/{len(tables)}] {table}")
                lines.append(f"## `{table}`")

                count = row_count(cursor, table)
                lines.append(f"- Row count: {count}")

                if table in DATE_RANGE_COLUMNS:
                    min_d, max_d = date_range(cursor, table, DATE_RANGE_COLUMNS[table])
                    lines.append(f"- Date range ({DATE_RANGE_COLUMNS[table]}): {min_d} → {max_d}")

                columns = describe_table(cursor, table)
                lines.append("")
                lines.append("| Field | Type | Null | Key | Default | Extra |")
                lines.append("|---|---|---|---|---|---|")
                for col in columns:
                    lines.append(
                        f"| {col['Field']} | {col['Type']} | {col['Null']} | {col['Key']} | "
                        f"{col['Default']} | {col['Extra']} |"
                    )
                lines.append("")
    finally:
        conn.close()

    with open(report_path, "w") as f:
        f.write("\n".join(lines))

    print(f"\nReport written to {report_path}")


if __name__ == "__main__":
    main()
