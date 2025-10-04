#!/bin/bash

# Run frontend in development mode (foreground)
# Usage: ./run-dev.sh

set -e

echo "🚀 Starting Frontend in Development Mode..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to frontend directory
cd front

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "📦 Installing dependencies..."
    npm install
fi

print_status "🎯 Starting React development server..."
print_status "Frontend will be available at: http://localhost:3000"
print_status "Auto-calculation is enabled with mock data"
print_status ""
print_warning "Press Ctrl+C to stop the server"
print_status ""

# Start development server in foreground
npm start