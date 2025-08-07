#!/bin/bash

# Production Migration Script
# This script runs Prisma migrations against the production database
# Usage: ./scripts/migrate-prod.sh

set -e  # Exit on error

echo "🚀 Starting production migration process..."
echo ""

# Check if .env.production.local exists
if [ ! -f .env.production.local ]; then
    echo "❌ Error: .env.production.local file not found!"
    echo "Please create .env.production.local with your production DATABASE_URL"
    echo ""
    echo "Example:"
    echo "DATABASE_URL=\"postgresql://user:password@host:port/database?schema=public\""
    echo "DIRECT_URL=\"postgresql://user:password@host:port/database?schema=public\""
    exit 1
fi

# Load production environment variables
echo "📦 Loading production environment variables..."
set -a
source .env.production.local
set +a

# Verify DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL is not set in .env.production.local"
    exit 1
fi

# Show connection info (without password)
echo "🔗 Connecting to database..."
echo "   Database URL: ${DATABASE_URL%%:*}://***"
echo ""

# Ask for confirmation
read -p "⚠️  Are you sure you want to run migrations on PRODUCTION database? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Migration cancelled."
    exit 0
fi

echo ""
echo "🔄 Running Prisma migrations..."

# Run prisma migrate deploy
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations successfully applied to production!"
    echo ""
    
    # Optional: Show migration status
    echo "📊 Current migration status:"
    npx prisma migrate status
else
    echo ""
    echo "❌ Migration failed! Please check the error messages above."
    exit 1
fi

echo ""
echo "🎉 Production migration completed successfully!"
