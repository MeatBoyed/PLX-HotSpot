This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Runtime vs Build-time environment variables

This app uses T3 Env (`src/env.ts`) to validate environment variables for both server and client.

- Server-only variables (in the `server` block of `src/env.ts`) are read at runtime. Updating these in `.env` and restarting the container is sufficient. Examples:
	- `PAYFAST_*`, `RADIUSDESK_*`, `MIKROTIK_RADIUS_DESK_BASE_URL`, `VOUCHER_DEFAULT_TTL_HOURS`, `USE_SEED_DATA`, `SITE_TITLE`, `SITE_DESCRIPTION`, `BRAND_NAME`.

- Public/client variables (prefixed with `NEXT_PUBLIC_`) are compiled into the client bundle at build time. Changing these requires rebuilding the image. Examples:
	- `NEXT_PUBLIC_SSID`, `NEXT_PUBLIC_MIKROTIK_*`.

Rule of thumb:
- Change only server vars → restart container (no rebuild required).
- Change any `NEXT_PUBLIC_*` or anything that affects build output → rebuild image.

## Recommended Env Strategy (Shared + Site-specific)

Use two env layers per service:
- `docker/env/.env.shared`: shared configuration (kept local/secret, git-ignored)
- `docker/env/sites/<portal>.env`: only site-specific values (branding + `NEXT_PUBLIC_*` + `BASE_URL` + portal RadiusDesk overrides)

Versioned template:
- `docker/env/.env.shared.example` is committed for structure/reference

Why this works:
- Docker Compose supports multiple `env_file` entries and applies them in order.
- Shared values stay in one place.
- Each portal only keeps minimal differences.
- Site-specific files can be committed, while shared secrets stay local-only.

For each portal service in `docker-compose.yml`:
- `build.args.SHARED_BUILD_ENV_FILE` points to `docker/env/.env.shared`
- `build.args.BUILD_ENV_FILE` points to `docker/env/sites/<portal>.env` (build-time `NEXT_PUBLIC_*` values)
- `env_file` includes both:
  - `docker/env/.env.shared`
  - `docker/env/sites/<portal>.env`

This keeps runtime secrets out of per-portal files and reduces duplication significantly.

## Docker Compose: site-specific deployments

Docker assets are organized under `docker/`:
- `docker/Dockerfile`
- `docker/docker-compose.yml`
- `docker/docker-compose.swarm.yml`

Compatibility files remain at repo root, so both command styles work:
- `docker compose up -d --build`
- `docker compose -f docker/docker-compose.yml up -d --build`

The Compose files now support per-site env files, ports, project names, and image names without copying anything to `.env` first.

Standard build and deploy:

```bash
docker compose --env-file .env.joburg-theatre up --build -d
```

Run a prebuilt image:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.joburg-theatre up -d
```

Each site env file should include both the app variables and a small deployment block for Compose interpolation:

```env
COMPOSE_PROJECT_NAME=vv-hotspot-joburg-theatre
IMAGE_REF=vv-hotspot-joburg-theatre:latest
BUILD_ENV_FILE=.env.joburg-theatre
RUNTIME_ENV_FILE=.env.joburg-theatre
HOST_PORT=3001

NEXT_PUBLIC_SSID=joburg-theatre
BASE_URL=https://joburg-theatre.example.com
BRAND_NAME=Joburg Theatre
```

What these variables do:
- `COMPOSE_PROJECT_NAME`: isolates the stack name, network, and container names per site.
- `IMAGE_REF`: gives each site its own image tag so builds do not overwrite each other.
- `BUILD_ENV_FILE`: the env file copied into the Docker build stage so Next.js gets the correct build-time `NEXT_PUBLIC_*` values.
- `RUNTIME_ENV_FILE`: the env file loaded into the running container.
- `HOST_PORT`: the host port mapped to container port `3000`.

Notes:
- `docker-compose.yml` is the build-and-run compose file.
- `docker-compose.prod.yml` expects the image in `IMAGE_REF` to already exist locally or in your registry.
- Changing any `NEXT_PUBLIC_*` values still requires a rebuild because Next.js inlines them into the client bundle.
- Server-only changes can be applied with `docker compose up -d` or a container restart once the runtime env file is updated.

What I built
- File: deploy-ssid.sh
- Behavior:
  - Determines SSID from your env file in this priority: NEXT_PUBLIC_SSID → SSID → PUBLIC_NEXT_SSID
  - Sanitizes SSID to be Docker-safe and uses it to form:
    - Image name: vv-hotspot-<sanitized-ssid>:<tag>
    - Container name: vv-hotspot-<sanitized-ssid>
  - Copies your chosen env file to .env for the build step (since Next inlines some vars at build time), then runs the container with `--env-file` to ensure runtime values are also applied.
  - Options:
    - `-e/--env` choose env file (default .env)
    - `-p/--port` host port (default 3000)
    - `--tag` specify tag (default `latest`; use `time` for timestamp tag)
    - `--no-build` skip the Docker build and just run
- Contracts:
  - Requires Docker installed
  - Exits early with readable errors if env file or SSID are missing

Try it
- Build and run on default port with .env:
```bash
cd next-captive-portal-rd
chmod +x deploy-ssid.sh
./deploy-ssid.sh
```

- Use a specific env and timestamped tag, map to port 3001:
```bash
./deploy-ssid.sh -e .env.prod --tag time -p 3001
```

- Run an already-built image (skip build):
```bash
./deploy-ssid.sh --no-build
```

Notes
- The script builds with `docker build` directly (not compose) and runs with `docker run` so the image/container names can be dynamically tied to the SSID without maintaining separate compose files per SSID.
- It copies your chosen env file to .env before building so Next.js gets build-time variables, then runs the container with `--env-file` so server-side runtime reads use the same values.
- If you change any `NEXT_PUBLIC_*` variables, re-run the script without `--no-build` to rebuild the image. For server-only vars, `--no-build` is fine—just restart the container.




## Local Development

Stand up a working local environment from a fresh clone using only the commands
below. The Next app runs on your host; only Postgres runs in Docker.

### Prerequisites

- **Node `24.18.0`** (pinned in `.nvmrc`). With nvm: `nvm install && nvm use`.
- **Docker** (for the local Postgres) — Docker Desktop or engine + compose v2.

### One-time setup

```bash
nvm use                         # match the pinned Node version
npm install                     # installs deps; postinstall runs `prisma generate`
cp .env.example .env.local      # dev env bootstrap (works as-is, no edits needed)
npm run db:up                   # start local Postgres (docker/docker-compose.dev.yml)
npm run db:migrate              # apply Prisma migrations
npm run db:seed                 # load dev seed data (IH Harris base + demo schools)
```

`.env.example` ships working local defaults: `DATABASE_URL` points at the dev
Postgres (`postgresql://postgres:postgres@localhost:55432/auraconnect`) and the
Clerk keys are **inert placeholders** so the build works — replace them with a
real [Clerk](https://dashboard.clerk.com) project's keys to use the admin area.

### Run

```bash
npm run dev                     # http://localhost:3000 (Turbopack)
```

### Database commands

| command | what it does |
|---------|--------------|
| `npm run db:up`     | start the local Postgres container |
| `npm run db:down`   | stop it (data volume retained) |
| `npm run db:migrate`| apply migrations (`prisma migrate dev`) |
| `npm run db:seed`   | run `prisma/seed.ts` (idempotent) |
| `npm run db:reset`  | drop, re-migrate, and re-seed (destructive — dev only) |

### Testing

```bash
npm test                        # Vitest unit tests (CI gate once wired)
npm run test:watch              # watch mode
```

### Before declaring a change done

```bash
npm run lint
npm run build
npm test
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
