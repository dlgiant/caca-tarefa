#!/bin/bash

# Remote Migration Trigger Script
# This script triggers the migration API endpoint on your deployed application
# Usage: ./scripts/trigger-remote-migration.sh [production-url] [api-key-or-token]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Remote Migration Trigger${NC}"
echo ""

# Get production URL from argument or environment
PRODUCTION_URL=${1:-$PRODUCTION_URL}
if [ -z "$PRODUCTION_URL" ]; then
    echo -e "${RED}❌ Error: Production URL not provided${NC}"
    echo "Usage: $0 <production-url> [api-key-or-token]"
    echo "Or set PRODUCTION_URL environment variable"
    exit 1
fi

# Get API key/token from argument or environment
API_KEY=${2:-$MIGRATION_SECRET_TOKEN}
API_KEY=${API_KEY:-$ADMIN_API_KEY}

if [ -z "$API_KEY" ]; then
    echo -e "${RED}❌ Error: API key or token not provided${NC}"
    echo "Usage: $0 <production-url> <api-key-or-token>"
    echo "Or set MIGRATION_SECRET_TOKEN or ADMIN_API_KEY environment variable"
    exit 1
fi

# Remove trailing slash from URL if present
PRODUCTION_URL=${PRODUCTION_URL%/}

echo -e "${YELLOW}🔗 Target URL: $PRODUCTION_URL/api/admin/migrate${NC}"
echo ""

# First, check migration status
echo -e "${GREEN}📊 Checking current migration status...${NC}"
STATUS_RESPONSE=$(curl -s -X GET \
    -H "Authorization: Bearer $API_KEY" \
    -H "x-api-key: $API_KEY" \
    "$PRODUCTION_URL/api/admin/migrate")

echo "$STATUS_RESPONSE" | jq . 2>/dev/null || echo "$STATUS_RESPONSE"
echo ""

# Ask for confirmation
read -p "Do you want to run migrations on production? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Migration cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}🔄 Triggering migration...${NC}"

# Trigger migration
RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -H "x-api-key: $API_KEY" \
    -d '{"dryRun": false}' \
    "$PRODUCTION_URL/api/admin/migrate")

# Check if jq is available for pretty printing
if command -v jq &> /dev/null; then
    echo "$RESPONSE" | jq .
else
    echo "$RESPONSE"
fi

# Check if migration was successful
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo ""
    echo -e "${GREEN}✅ Migration completed successfully!${NC}"
else
    echo ""
    echo -e "${RED}❌ Migration failed. Check the response above for details.${NC}"
    exit 1
fi
