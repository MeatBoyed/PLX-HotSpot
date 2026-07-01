# RadiusDesk Schema Explorer

One-off diagnostic script — dumps `DESCRIBE` + row count for every table in the RadiusDesk `rd` MariaDB database, plus the retained date range for `radacct`/`radacct_history`/`radpostauth`, into a single Markdown report.

Ground truth before building the usage-reporting integration, rather than assuming standard FreeRADIUS schema applies everywhere (RadiusDesk's `rd` database has 224 tables — far more than bare FreeRADIUS).

## Setup

```bash
cp .env.example .env
# fill in RD_DB_HOST / RD_DB_USER / RD_DB_PASSWORD — read-only credential
pip install -r requirements.txt
```

## Run

```bash
python3 explore_schema.py
```

Writes `reports/rd_schema_<timestamp>.md`.
