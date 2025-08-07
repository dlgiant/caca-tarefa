// Re-export auth functions from src/auth
import { auth } from '@/src/auth';

// Export auth as getServerSession for backward compatibility
export const getServerSession = auth;

// Also export auth directly
export { auth };
