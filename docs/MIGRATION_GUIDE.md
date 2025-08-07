# Post-Deployment Migration Guide

This guide explains how to handle database migrations for your Vercel deployment, since migrations should NOT run during build time on Vercel.

## Why Not Run Migrations During Build?

- Build processes on Vercel are ephemeral and can run multiple times
- Multiple concurrent builds could cause migration conflicts
- Build environment may not have proper database access
- Rollbacks become complicated if migrations are tied to builds

## Available Migration Strategies

### Option 1: Local Migration Script (Recommended) ⭐

Run migrations from your local machine against the production database before or after deploying.

#### Setup:

1. Create `.env.production.local` file (never commit this!):

```env
DATABASE_URL="your-production-database-url"
DIRECT_URL="your-production-direct-url"
```

2. Add to `.gitignore`:

```
.env.production.local
```

#### Usage:

```bash
# Run production migrations
./scripts/migrate-prod.sh

# Or using npm script
npm run migrate:prod
```

**Advantages:**

- Simple and straightforward
- Full control over when migrations run
- Easy to rollback if needed
- Can verify migrations before deployment

**Disadvantages:**

- Requires manual intervention
- Need secure access to production database

---

### Option 2: GitHub Actions Workflow

Automatically run migrations after successful Vercel deployment.

#### Setup:

1. Add secrets to GitHub repository:
   - Go to Settings → Secrets → Actions
   - Add `DATABASE_URL` and `DIRECT_URL`

2. The workflow is already configured in `.github/workflows/post-deploy-migrate.yml`

#### Usage:

**Automatic:** Migrations run after each successful deployment to production.

**Manual:** Trigger from GitHub Actions tab:

1. Go to Actions → Post-Deployment Migration
2. Click "Run workflow"
3. Select environment (production/preview)
4. Click "Run workflow" button

**Advantages:**

- Fully automated
- Consistent process
- Audit trail in GitHub
- Can be integrated with deployment notifications

**Disadvantages:**

- Requires GitHub Actions minutes
- Need to manage secrets in GitHub
- Less immediate control

---

### Option 3: Protected API Endpoint

Trigger migrations via a secure API endpoint after deployment.

#### Setup:

1. Add environment variables to Vercel:

```env
MIGRATION_SECRET_TOKEN="your-secret-token-here"
# or
ADMIN_API_KEY="your-admin-api-key-here"
```

2. The endpoint is available at `/api/admin/migrate`

#### Usage:

**Via Script:**

```bash
# Using the trigger script
./scripts/trigger-remote-migration.sh https://your-app.vercel.app your-secret-token

# Or set environment variables
export PRODUCTION_URL="https://your-app.vercel.app"
export MIGRATION_SECRET_TOKEN="your-secret-token"
./scripts/trigger-remote-migration.sh
```

**Via cURL:**

```bash
# Check migration status
curl -X GET https://your-app.vercel.app/api/admin/migrate \
  -H "Authorization: Bearer your-secret-token"

# Run migrations
curl -X POST https://your-app.vercel.app/api/admin/migrate \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}'
```

**Via API Client (Postman, Insomnia, etc.):**

- **GET** `/api/admin/migrate` - Check migration status
- **POST** `/api/admin/migrate` - Run migrations
  - Body: `{"dryRun": false}`
  - Headers: `Authorization: Bearer <token>` or `x-api-key: <api-key>`

**Advantages:**

- Can be triggered from anywhere
- No direct database access needed
- Can be integrated with deployment scripts
- Supports dry-run mode

**Disadvantages:**

- Requires securing the endpoint
- Adds complexity to your application
- Limited error recovery options

---

## Recommended Workflow

For most projects, we recommend a combination approach:

### For Production Deployments:

1. **Before Deployment:**

   ```bash
   # Review pending migrations
   npx prisma migrate status

   # Test migrations locally
   npm run db:migrate
   ```

2. **Deploy to Vercel:**

   ```bash
   git push origin main
   # or
   vercel --prod
   ```

3. **After Deployment:**

   ```bash
   # Run production migrations
   ./scripts/migrate-prod.sh
   ```

4. **Verify:**
   ```bash
   # Check application health
   curl https://your-app.vercel.app/api/health
   ```

### For Preview Deployments:

Preview deployments typically use a separate database, so migrations can run automatically via GitHub Actions or you can use branch-specific databases.

---

## Adding NPM Scripts

Add these helpful scripts to your `package.json`:

```json
{
  "scripts": {
    "migrate:prod": "./scripts/migrate-prod.sh",
    "migrate:prod:status": "source .env.production.local && npx prisma migrate status",
    "migrate:prod:remote": "./scripts/trigger-remote-migration.sh"
  }
}
```

---

## Security Best Practices

1. **Never commit** `.env.production.local` files
2. **Use strong tokens** for API authentication (minimum 32 characters)
3. **Rotate secrets** regularly
4. **Limit database access** to specific IPs when possible
5. **Monitor migration logs** for unauthorized attempts
6. **Use read-only replicas** for non-migration operations
7. **Backup before migrations** in production

---

## Troubleshooting

### Migration Fails

1. Check database connectivity:

   ```bash
   npx prisma db pull
   ```

2. Verify migration status:

   ```bash
   npx prisma migrate status
   ```

3. Check for pending migrations:
   ```bash
   npx prisma migrate diff \
     --from-schema-datasource prisma/schema.prisma \
     --to-schema-datamodel prisma/schema.prisma \
     --exit-code
   ```

### Rollback Migrations

Prisma doesn't support automatic rollbacks. To rollback:

1. Create a new migration that undoes the changes
2. Or restore from backup:
   ```bash
   npm run restore:backup
   ```

### Connection Issues

- Verify `DATABASE_URL` format
- Check if database allows external connections
- Ensure SSL is configured if required:
  ```
  DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
  ```

---

## Environment-Specific Configuration

### Development

- Migrations run automatically with `npm run db:migrate`
- Use local database

### Staging/Preview

- Use preview database
- Can use GitHub Actions for automated migrations
- Or use branch-specific databases

### Production

- Use manual migration script (Option 1)
- Or GitHub Actions with manual trigger (Option 2)
- Always backup before migrating

---

## Monitoring & Alerts

Consider setting up monitoring for:

- Failed migration attempts
- Unauthorized API access
- Database connection issues
- Migration duration

You can integrate with:

- Vercel Analytics
- Sentry for error tracking
- Custom webhook notifications
- Slack/Discord notifications via GitHub Actions

---

## Quick Reference

```bash
# Check what migrations would be applied
source .env.production.local && npx prisma migrate status

# Run migrations locally against production
./scripts/migrate-prod.sh

# Trigger remote migrations
./scripts/trigger-remote-migration.sh https://your-app.vercel.app your-token

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Generate Prisma Client
npx prisma generate
```

---

## Need Help?

- Check Prisma documentation: https://www.prisma.io/docs
- Vercel deployment docs: https://vercel.com/docs
- Open an issue in your repository
- Review migration logs in Vercel dashboard
