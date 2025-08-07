# Vercel Environment Variables Verification Checklist

## Current Status ✅

Based on the Vercel CLI output, you have the following environment variables configured:

- ✅ **DATABASE_URL** - Set for Production and Preview environments
- ✅ **DIRECT_URL** - Set for Production and Preview environments

## ⚠️ Missing Development Environment

Neither `DATABASE_URL` nor `DIRECT_URL` appear to be set for the Development environment. You may want to add them if needed for local development through Vercel.

## Verification Steps

### 1. Access Vercel Dashboard

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: **caca-tarefa**
3. Navigate to **Settings** → **Environment Variables**

### 2. Verify DATABASE_URL Configuration

Check that `DATABASE_URL` uses the **Supabase connection pooler URL** format:

```
postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Key points to verify:**

- ✅ Uses port `6543` (pooler port, not 5432)
- ✅ Contains `pooler.supabase.com` in the hostname
- ✅ Has `?pgbouncer=true` parameter
- ✅ Has `&connection_limit=1` parameter (recommended for serverless)
- ✅ Schema parameter is optional (defaults to public)

### 3. Verify DIRECT_URL Configuration

Check that `DIRECT_URL` uses the **direct connection URL** format:

```
postgresql://postgres.[your-project-ref]:[your-password]@db.[your-project-ref].supabase.co:5432/postgres
```

**Key points to verify:**

- ✅ Uses port `5432` (direct connection port)
- ✅ Contains `db.[project-ref].supabase.co` in the hostname
- ✅ NO pgbouncer parameters
- ✅ Used for Prisma migrations and schema updates

### 4. Environment Availability

Verify that both variables are available for the correct environments:

| Variable     | Production | Preview | Development |
| ------------ | ---------- | ------- | ----------- |
| DATABASE_URL | ✅ Set     | ✅ Set  | ❌ Not Set  |
| DIRECT_URL   | ✅ Set     | ✅ Set  | ❌ Not Set  |

**Recommendation:**

- Production and Preview are correctly configured
- Consider adding to Development if you need to test with Vercel dev locally

### 5. Get Your Supabase Connection Strings

To find your correct connection strings:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **Database**
4. Look for **Connection string** section
5. You'll find:
   - **Connection pooling** → Use this for `DATABASE_URL`
   - **Direct connection** → Use this for `DIRECT_URL`

### 6. Test the Configuration

After verifying, you can test the configuration:

```bash
# Pull the environment variables locally
vercel env pull .env.local

# Check if variables are correctly set
vercel env ls

# Deploy to preview to test
vercel --prod=false

# Deploy to production when ready
vercel --prod
```

### 7. Additional Variables to Consider

Based on your `.env.production.example`, ensure these are also set in Vercel:

**Required:**

- [ ] `NEXTAUTH_URL` - Should be your production URL (e.g., https://your-app.vercel.app)
- [ ] `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- [ ] `ANTHROPIC_API_KEY` - Your Claude AI API key

**Optional but recommended:**

- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- [ ] `CRON_SECRET` - For securing cron jobs

## Common Issues and Solutions

### Issue 1: Connection Timeout

**Symptom:** Database queries timeout in production
**Solution:** Ensure you're using the pooler URL for `DATABASE_URL`

### Issue 2: Migration Failures

**Symptom:** Prisma migrations fail
**Solution:** Ensure `DIRECT_URL` is set and uses the direct connection (port 5432)

### Issue 3: Too Many Connections

**Symptom:** "Too many connections" error
**Solution:** Add `?connection_limit=1` to your `DATABASE_URL`

### Issue 4: Schema Not Found

**Symptom:** Tables not found in queries
**Solution:** Add `?schema=public` to your connection strings if not using default schema

## Quick Verification Commands

```bash
# Check current environment variables in Vercel
vercel env ls

# Pull and inspect a specific variable (it will be encrypted)
vercel env pull

# Add a new environment variable
vercel env add DATABASE_URL

# Remove and re-add if you need to update
vercel env rm DATABASE_URL
vercel env add DATABASE_URL
```

## Security Best Practices

1. ✅ Never commit real database credentials to Git
2. ✅ Use different database credentials for each environment
3. ✅ Rotate credentials periodically
4. ✅ Use connection pooling for serverless environments
5. ✅ Limit connection pool size to prevent exhaustion
