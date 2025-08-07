# Database Connection Pooling Configuration

## Overview

This document explains how connection pooling is configured for the application using Prisma with Supabase PostgreSQL.

## Connection URLs

### DATABASE_URL (Pooled Connection)

- **Port**: 6543 (PgBouncer)
- **Purpose**: Used for all application queries
- **Connection String Format**:
  ```
  postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
  ```
- **Key Parameters**:
  - `pgbouncer=true`: Enables connection pooling via PgBouncer
  - `connection_limit=1`: Recommended for serverless environments to prevent connection exhaustion

### DIRECT_URL (Direct Connection)

- **Port**: 5432 (Direct PostgreSQL)
- **Purpose**: Used only for database migrations
- **Connection String Format**:
  ```
  postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
  ```
- **Note**: Bypasses PgBouncer for schema migrations that require a direct connection

## Prisma Configuration

### Schema Configuration (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")      // Pooled connection for queries
  directUrl = env("DIRECT_URL")       // Direct connection for migrations
}
```

### Client Configuration (`lib/prisma.ts`)

The Prisma client is configured as a singleton to prevent multiple instances in serverless environments:

- Logging is enabled in development mode for debugging
- Connection URL is explicitly set from environment variables
- Singleton pattern prevents connection leaks

## Best Practices

1. **Always use pooled connections** for application queries to prevent connection exhaustion
2. **Use direct connections only for migrations** that require DDL operations
3. **Set connection_limit=1** in serverless environments (Vercel, Netlify, etc.)
4. **Monitor connection usage** in Supabase dashboard to ensure optimal performance
5. **Use the singleton pattern** for Prisma client to prevent multiple instances

## Troubleshooting

### Common Issues

1. **"Too many connections" error**
   - Ensure `pgbouncer=true` is in the DATABASE_URL
   - Verify `connection_limit=1` is set
   - Check that the Prisma client singleton is properly implemented

2. **Migration failures**
   - Ensure DIRECT_URL is properly configured
   - Verify the direct connection uses port 5432
   - Check that migrations are not using the pooled connection

3. **Connection timeouts**
   - Verify Supabase project is active and not paused
   - Check network connectivity
   - Ensure correct credentials are being used

## References

- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling)
- [PgBouncer Documentation](https://www.pgbouncer.org/)
