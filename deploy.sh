#!/bin/bash

# Deployment script for Raspberry Pi
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="pension-simulator"

echo "🚀 Deploying Pension Simulator to $ENVIRONMENT environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Remove old images (optional, saves space on Pi)
if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Cleaning up old images..."
    docker system prune -f || true
fi

# Build and start services
print_status "Building and starting services..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose --profile production up -d --build
else
    docker-compose up -d --build
fi

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check backend
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    print_status "✅ Backend API is healthy"
else
    print_warning "⚠️ Backend API health check failed"
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "✅ Frontend is healthy"
else
    print_warning "⚠️ Frontend health check failed"
fi

# Show running containers
print_status "Running containers:"
docker-compose ps

# Show logs (last 20 lines)
print_status "Recent logs:"
docker-compose logs --tail=20

print_status "🎉 Deployment completed!"
print_status "Frontend: http://localhost:3000"
print_status "Backend API: http://localhost:8080"

if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Nginx Proxy: http://localhost:80"
fi

print_status "To view logs: docker-compose logs -f"
print_status "To stop: docker-compose down"