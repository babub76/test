#!/bin/bash

# Lambda Template Setup Script
# Run this script to set up a new Lambda project from the template

set -e

echo "🚀 AWS Lambda Template Setup"
echo "============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
echo -e "${GREEN}✓ npm $(npm --version)${NC}"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Create environment file
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file (update with your configuration)${NC}"
else
    echo -e "${YELLOW}⚠ .env file already exists${NC}"
fi
echo ""

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ TypeScript compiled successfully${NC}"
else
    echo -e "${RED}✗ TypeScript compilation failed${NC}"
    exit 1
fi
echo ""

# Run tests
echo "🧪 Running tests..."
npm test -- --passWithNoTests

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Tests passed${NC}"
else
    echo -e "${YELLOW}⚠ Some tests failed (this may be expected for fresh setup)${NC}"
fi
echo ""

# Display next steps
echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update .env with your configuration"
echo "2. Modify src/handler.ts with your business logic"
echo "3. Add tests for your implementation"
echo "4. Run 'npm run build' to compile"
echo "5. Run 'npm test' to verify"
echo ""
echo "📖 Documentation:"
echo "  - Quick start: QUICKSTART.md"
echo "  - Full guide: README.md"
echo "  - Deployment: DEPLOYMENT.md"
echo "  - Structure: STRUCTURE.md"
echo ""
echo "Available commands:"
echo "  npm run build       - Compile TypeScript"
echo "  npm run dev         - Run with hot reload"
echo "  npm test            - Run tests"
echo "  npm test:watch      - Watch mode for tests"
echo "  npm run lint        - Check code quality"
echo "  npm run clean       - Remove build artifacts"
echo ""
