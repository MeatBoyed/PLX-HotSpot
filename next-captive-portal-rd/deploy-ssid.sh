#!/usr/bin/env bash
set -euo pipefail

# Build & run a container with dynamic image/container name derived from SSID
# Priority for SSID: NEXT_PUBLIC_SSID > SSID > PUBLIC_NEXT_SSID
# Defaults:
#   - env file: .env
#   - host port: 3000
#   - image base name: vv-hotspot
#   - tag: latest (or timestamp if --tag time)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()    { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; }

ENV_FILE=".env"
HOST_PORT="3000"
IMAGE_BASE="vv-hotspot"
TAG="latest"
NO_BUILD="false"

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

Options:
  -e, --env FILE        Env file to use (default: .env)
  -p, --port PORT       Host port to map to 3000 (default: 3000)
      --tag TAG         Image tag (default: latest). Use 'time' for timestamp tag
      --no-build        Skip docker build (use existing image)
  -h, --help            Show this help

Examples:
  $(basename "$0") -e .env.prod --tag time -p 3001
  $(basename "$0")               # uses .env, builds image, runs on :3000
EOF
}

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    -e|--env)  ENV_FILE="$2"; shift 2;;
    -p|--port) HOST_PORT="$2"; shift 2;;
    --tag)     TAG="$2"; shift 2;;
    --no-build) NO_BUILD="true"; shift;;
    -h|--help) usage; exit 0;;
    *) error "Unknown option: $1"; usage; exit 1;;
  esac
done

if [[ ! -f "$ENV_FILE" ]]; then
  error "Env file not found: $ENV_FILE"
  exit 1
fi

info "Using env file: $ENV_FILE"

# Extract SSID from env file (without exporting into shell env)
# Greedy match last occurrence; strip quotes/whitespace
get_var() {
  local key="$1" file="$2"
  awk -v k="^"$key"=" 'BEGIN{IGNORECASE=0} $0 ~ k {v=$0} END{print v}' "$file" \
    | sed -E 's/^[^=]+=\s*//; s/^"|^\x27//; s/"$|\x27$//'
}

SSID_RAW=$(get_var NEXT_PUBLIC_SSID "$ENV_FILE")
if [[ -z "$SSID_RAW" ]]; then
  SSID_RAW=$(get_var SSID "$ENV_FILE")
fi
if [[ -z "$SSID_RAW" ]]; then
  SSID_RAW=$(get_var PUBLIC_NEXT_SSID "$ENV_FILE")
fi

if [[ -z "$SSID_RAW" ]]; then
  error "Could not determine SSID from env (NEXT_PUBLIC_SSID / SSID / PUBLIC_NEXT_SSID)."
  exit 1
fi

# Sanitize for docker names and tags: lowercase, replace invalid with '-'
SSID_SAN=$(echo "$SSID_RAW" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')
if [[ -z "$SSID_SAN" ]]; then
  error "SSID sanitized to empty. Original: '$SSID_RAW'"
  exit 1
fi

IMAGE_NAME="${IMAGE_BASE}-${SSID_SAN}"
if [[ "$TAG" == "time" ]]; then
  TAG=$(date +%Y%m%d%H%M%S)
fi
CONTAINER_NAME="$IMAGE_NAME"

info "SSID: $SSID_RAW -> $SSID_SAN"
info "Image: ${IMAGE_NAME}:${TAG}"
info "Container: ${CONTAINER_NAME}"
info "Host port -> container port: ${HOST_PORT}:3000"

# Copy env file to .env for build stage (Next build reads .env)
# Keep a backup if a different .env exists
if [[ "$ENV_FILE" != ".env" ]]; then
  if [[ -f .env && ! -L .env ]]; then
    cp .env .env.bak.$(date +%s)
    warn "Backed up existing .env to .env.bak.*"
  fi
  cp "$ENV_FILE" .env
  info "Copied $ENV_FILE to .env for build"
fi

if [[ "$NO_BUILD" != "true" ]]; then
  info "Building image..."
  docker build -t "${IMAGE_NAME}:${TAG}" .
  info "Build complete"
else
  warn "Skipping build as requested (--no-build)"
fi

# Stop and remove existing container if present
if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  warn "Container $CONTAINER_NAME exists. Recreating..."
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
fi

# Run container
info "Starting container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --env-file "$ENV_FILE" \
  -p "${HOST_PORT}:3000" \
  --restart unless-stopped \
  "${IMAGE_NAME}:${TAG}"

info "Container started"
info "Logs: docker logs -f ${CONTAINER_NAME}"
info "Stop: docker stop ${CONTAINER_NAME} && docker rm ${CONTAINER_NAME}"
info "Open: http://localhost:${HOST_PORT}"
