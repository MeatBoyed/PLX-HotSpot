#!/usr/bin/env python3
import os

import pymysql
from dotenv import load_dotenv

load_dotenv()

conn = pymysql.connect(
    host=os.getenv("RD_DB_HOST"),
    port=int(os.getenv("RD_DB_PORT", "3306")),
    user=os.getenv("RD_DB_USER"),
    password=os.getenv("RD_DB_PASSWORD"),
    database=os.getenv("RD_DB_NAME", "rd"),
    cursorclass=pymysql.cursors.DictCursor,
)

with conn:
    with conn.cursor() as cur:
        cur.execute("""
            SELECT calledstationid, COUNT(*) AS sessions, MIN(acctstarttime) AS first_seen, MAX(acctstarttime) AS last_seen
            FROM radacct_history
            GROUP BY calledstationid
            ORDER BY sessions DESC
        """)
        for row in cur.fetchall():
            print(row)

        print("\n=== distinct nasidentifier values (confirm single shared NAS) ===")
        cur.execute("SELECT nasidentifier, nasipaddress, COUNT(*) AS c FROM radacct_history GROUP BY nasidentifier, nasipaddress")
        for row in cur.fetchall():
            print(row)
