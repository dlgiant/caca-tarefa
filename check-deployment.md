# Vercel Deployment Checklist

## 1. Monitor Deployment Status

Visit your Vercel dashboard to monitor the deployment:

- Go to: https://vercel.com/dashboard
- Check your project's deployment status
- Look for the build triggered by commit: `017bd02`

## 2. Expected Build Process

The build should now:

1. ✅ Install dependencies
2. ✅ Generate Prisma Client (`prisma generate`)
3. ✅ Build Next.js application
4. ❌ NOT run migrations automatically (we removed `prisma migrate deploy`)

## 3. Check Build Logs

In the Vercel build logs, you should see:

- `prisma generate` running successfully
- Connection to Supabase database via pooled connection (port 6543)
- Successful Next.js build

## 4. Verify Environment Variables

Ensure these are set in Vercel:

- `DATABASE_URL` - Should use port 6543 (pgbouncer/pooled)
- `DIRECT_URL` - Should use port 5432 (direct connection)

## 5. After Successful Deployment

Once the deployment is successful, you need to run migrations separately:

### Option A: Via Migration API Endpoint

```bash
# Replace YOUR_DEPLOYMENT_URL with your actual Vercel URL
curl -X POST https://YOUR_DEPLOYMENT_URL/api/admin/migrate \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN" \
  -H "Content-Type: application/json"
```

### Option B: Via Local Script

```bash
# From your local machine with production credentials
source .env.production.local
npx prisma migrate deploy
```

### Option C: Via GitHub Actions (if configured)

The workflow will run automatically after successful deployment.

## 6. Test Database Connection

After deployment, test the connection:

```bash
# Test a simple API endpoint that uses the database
curl https://YOUR_DEPLOYMENT_URL/api/tasks
```

## 7. Common Issues & Solutions

### Issue: Prisma Client not generated

**Solution**: Check that `prisma generate` is in the build command

### Issue: Connection timeout

**Solution**: Verify DATABASE_URL uses port 6543 for pooling

### Issue: SSL/TLS errors

**Solution**: Ensure connection string includes proper SSL parameters

### Issue: Migration not applied

**Solution**: Run migrations manually using one of the methods above

## 8. Rollback Plan

If issues occur:

1. Revert to previous deployment in Vercel
2. Fix the issue locally
3. Test thoroughly with production credentials
4. Deploy again

## Next Steps

1. Monitor the current deployment
2. Once successful, run migrations
3. Test the application thoroughly
4. Set up automated migration workflow for future deployments
