# Docker Setup for PLX-HotSpot

This directory contains Docker configuration for running the PLX-HotSpot application with environment-based configuration.

## Quick Start

### 1. Choose your configuration

Copy one of the example environment files:

```bash
# For PluxNet configuration
cp .env.pluxnet .env

# For City of Johannesburg configuration  
cp .env.cityofjbh .env

# Or create your own from the example
cp .env.example .env
```

### 2. Build and run

```bash
# Build the Docker image
docker-compose build

# Run the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

## Environment Configuration

### Available Environment Files

- **`.env.example`** - Template with all available options
- **`.env.pluxnet`** - PluxNet Fibre configuration
- **`.env.cityofjbh`** - City of Johannesburg configuration

### Key Environment Variables

| Variable                        | Description                                      | Default                 |
| ------------------------------- | ------------------------------------------------ | ----------------------- |
| `USE_SEED_DATA`                 | Use mock data for testing                        | `false`                 |
| `SELECTED_THEME`                | Theme to use (`pluxnet`, `cityofjbh`, `example`) | `pluxnet`               |
| `SITE_TITLE`                    | Application title                                | `PluxNet Fibre HotSpot` |
| `HOTSPOT_PROVIDER_NAME`         | Provider name shown to users                     | `PluxNet Fibre`         |
| `MIKROTIK_RADIUS_DESK_BASE_URL` | RadiusDesk API URL                               | -                       |

### Creating Custom Configuration

1. Copy `.env.example` to `.env`
2. Modify the values as needed
3. Run `docker-compose up -d`

## Usage Examples

### Development Mode with Seed Data
```bash
# Create a development environment file
echo "USE_SEED_DATA=true" > .env.dev
echo "SELECTED_THEME=pluxnet" >> .env.dev

# Copy to .env and run
cp .env.dev .env
docker-compose up -d
```

### Production Mode
```bash
# Use production configuration
cp .env.pluxnet .env

# Modify any production-specific values
# Then run
docker-compose up -d
```

## Themes

Available themes can be set via `SELECTED_THEME`:

- `pluxnet` - PluxNet brand theme
- `cityofjbh` - City of Johannesburg theme  
- `example` - Example business theme

## Network Configuration

The application runs on port 3000 by default. The Docker Compose file creates an isolated network for the application.

To change the port, modify the `ports` section in `docker-compose.yaml`:

```yaml
ports:
  - "8080:3000"  # Run on port 8080 instead
```
