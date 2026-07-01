#!/usr/bin/env python3
"""Pulls real sample rows to ground the site-correlation strategy in actual data,
not just schema/table names."""
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

queries = {
    "clouds (all)": "SELECT id, name, description FROM clouds",
    "realms (all)": "SELECT id, name, cloud_id, suffix, suffix_permanent_users, city FROM realms",
    "na_realms -> nas + realm names": """
        SELECT n.id AS nas_id, n.nasname, n.shortname, r.id AS realm_id, r.name AS realm_name
        FROM na_realms nr
        JOIN nas n ON n.id = nr.na_id
        JOIN realms r ON r.id = nr.realm_id
        ORDER BY n.id, r.id
    """,
    "permanent_users matching 'trail'/'trial'": """
        SELECT username, realm, realm_id, site, profile, data_used, data_cap, time_used, time_cap,
               admin_state, mac_address, last_accept_nas
        FROM permanent_users
        WHERE username LIKE '%trail%' OR username LIKE '%trial%'
        LIMIT 20
    """,
    "recent radacct_history sessions": """
        SELECT username, realm, groupname, nasipaddress, nasidentifier, calledstationid,
               callingstationid, acctstarttime, acctstoptime, acctinputoctets, acctoutputoctets,
               acctterminatecause
        FROM radacct_history
        ORDER BY acctstarttime DESC
        LIMIT 20
    """,
    "distinct calledstationid (sample)": "SELECT DISTINCT calledstationid FROM radacct_history LIMIT 30",
    "distinct realm values in radacct_history": "SELECT realm, COUNT(*) AS c FROM radacct_history GROUP BY realm ORDER BY c DESC LIMIT 30",
}

with conn:
    with conn.cursor() as cur:
        for label, sql in queries.items():
            print(f"\n=== {label} ===")
            cur.execute(sql)
            rows = cur.fetchall()
            if not rows:
                print("(no rows)")
                continue
            for row in rows:
                print(row)
