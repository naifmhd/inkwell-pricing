// Edge-safe middleware — uses only authConfig (no DB access)
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

const { auth } = NextAuth(authConfig);
export default auth;

export const config = {
  matcher: ['/admin/:path*'],
};
