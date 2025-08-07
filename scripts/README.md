# Scripts Directory

This directory contains utility scripts for managing the application.

## Migration Scripts

### `migrate-prod.sh`

Runs database migrations against the production database from your local machine.

**Setup:**

1. Copy `.env.production.local.example` to `.env.production.local`
2. Add your production database credentials
3. Run: `./scripts/migrate-prod.sh` or `npm run migrate:prod`

**Safety features:**

- Requires confirmation before running
- Shows connection info (without password)
- Displays migration status after completion

### `trigger-remote-migration.sh`

Triggers migrations via the API endpoint on your deployed application.

**Usage:**

```bash
# With arguments
./scripts/trigger-remote-migration.sh https://your-app.vercel.app your-secret-token

# With environment variables
export PRODUCTION_URL="https://your-app.vercel.app"
export MIGRATION_SECRET_TOKEN="your-secret-token"
./scripts/trigger-remote-migration.sh

# Or using npm
npm run migrate:prod:remote
```

## Other Scripts

### `backup.ts`

Creates database backups. Can be run locally or in production.

```bash
npm run backup        # Local backup
npm run backup:prod   # Production backup
```

### `test-production.ts`

Tests production environment configuration and connectivity.

```bash
npm run test:production
```

### `setup-supabase.ts`

Sets up Supabase configuration for the project.

```bash
npm run setup:supabase
```

## Security Notes

- **Never commit** `.env.production.local` to version control
- Keep production credentials secure
- Use strong tokens (32+ characters) for API authentication
- Rotate credentials regularly
- Always backup before running migrations in production

## Troubleshooting

If a script fails:

1. Check file permissions: `chmod +x scripts/*.sh`
2. Verify environment variables are set correctly
3. Check database connectivity
4. Review error messages for specific issues

For more information, see `/docs/MIGRATION_GUIDE.md`
