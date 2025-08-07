import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { headers } from 'next/headers';
const execAsync = promisify(exec);
// Security: Add your authentication method here
async function isAuthorized(_request: NextRequest): Promise<boolean> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  // Option 1: Check for a secret token
  const secretToken = process.env.MIGRATION_SECRET_TOKEN;
  if (secretToken && authHeader === `Bearer ${secretToken}`) {
    return true;
  }
  // Option 2: Check if user is admin (requires NextAuth integration)
  // const session = await getServerSession();
  // if (session?.user?.role === 'admin') {
  //   return true;
  // }
  // Option 3: Check for specific API key
  const apiKey = headersList.get('x-api-key');
  if (apiKey === process.env.ADMIN_API_KEY) {
    return true;
  }
  return false;
}
export async function POST(request: NextRequest) {
  try {
    // Check if in production
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        {
          error: 'This endpoint is only available in production',
          environment: process.env.NODE_ENV,
        },
        { status: 400 }
      );
    }
    // Verify authorization
    const authorized = await isAuthorized(request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Parse request body for options
    const body = await request.json().catch(() => ({}));
    const { dryRun = false } = body;
    console.log('🔄 Starting database migration...');
    // Run migration command
    const command = dryRun
      ? 'npx prisma migrate status'
      : 'npx prisma migrate deploy';
    const { stdout, stderr } = await execAsync(command, {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
        DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL,
      },
    });
    if (stderr && !stderr.includes('warn')) {
      console.error('Migration error:', stderr);
      return NextResponse.json(
        {
          success: false,
          error: 'Migration failed',
          details: stderr,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
    console.log('✅ Migration completed successfully');
    return NextResponse.json({
      success: true,
      message: dryRun
        ? 'Migration status checked'
        : 'Migrations applied successfully',
      output: stdout,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
// GET endpoint to check migration status
export async function GET(_request: NextRequest) {
  try {
    // Verify authorization
    const authorized = await isAuthorized(_request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Check migration status
    const { stdout, stderr: _stderr } = await execAsync(
      'npx prisma migrate status',
      {
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL,
          DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
      }
    );
    return NextResponse.json({
      success: true,
      status: stdout,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check migration status',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
