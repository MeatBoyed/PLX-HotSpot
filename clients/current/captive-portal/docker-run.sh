#!/bin/bash

# Simple Docker build and run script for PLX-HotSpot

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default values
ENV_FILE=".env.pluxnet"
ACTION="run"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env|-e)
            ENV_FILE="$2"
            shift 2
            ;;
        --build|-b)
            ACTION="build"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -e, --env FILE    Environment file to use (default: .env.pluxnet)"
            echo "  -b, --build       Build the Docker image"
            echo "  -h, --help        Show this help message"
            echo ""
            echo "Available environment files:"
            echo "  .env.pluxnet      PluxNet configuration"
            echo "  .env.cityofjbh    City of Johannesburg configuration"
            echo "  .env.example      Example configuration template"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check if environment file exists
if [[ ! -f "$ENV_FILE" ]]; then
    print_error "Environment file '$ENV_FILE' not found!"
    print_warning "Available environment files:"
    ls -la .env.* 2>/dev/null || echo "No .env files found"
    exit 1
fi

print_status "Using environment file: $ENV_FILE"

# Copy the selected env file to .env for docker-compose
cp "$ENV_FILE" .env
print_status "Copied $ENV_FILE to .env"

if [[ "$ACTION" == "build" ]]; then
    print_status "Building Docker image..."
    docker compose build
    if [[ $? -eq 0 ]]; then
        print_status "✅ Docker image built successfully!"
    else
        print_error "❌ Docker build failed!"
        exit 1
    fi
else
    print_status "Starting application with Docker Compose..."
    docker compose up -d
    
    if [[ $? -eq 0 ]]; then
        print_status "✅ Application started successfully!"
        print_status "🌐 Application is running at: http://localhost:3000"
        print_status "📋 To view logs: docker compose logs -f"
        print_status "🛑 To stop: docker compose down"
    else
        print_error "❌ Failed to start application!"
        exit 1
    fi
fi
