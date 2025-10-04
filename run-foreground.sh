#!/bin/bash

# Run Pension Simulator in foreground
# Usage: ./run-foreground.sh [environment]

set -e

ENVIRONMENT=${1:-development}
PROJECT_NAME="pension-simulator"

echo "🚀 Starting Pension Simulator in foreground mode..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Cleanup function
cleanup() {
    print_status "🛑 Shutting down services..."
    docker-compose down --remove-orphans
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans || true

# Build services first
print_status "Building services..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose --profile production build
else
    docker-compose build
fi

print_status "🎯 Starting services in foreground mode..."
print_status "Press Ctrl+C to stop all services"
print_status ""

# Start services in foreground
if [ "$ENVIRONMENT" = "production" ]; then
    print_status "🏭 Production mode - starting with Nginx proxy"
    docker-compose --profile production up --no-build
else
    print_status "🔧 Development mode - direct access"
    docker-compose up --no-build
fi