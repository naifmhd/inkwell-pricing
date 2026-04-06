// Edge-safe auth config (no Node.js APIs — used in middleware)
import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  providers: [], // Credentials provider added in index.ts (Node.js only)
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const isProtected = path.startsWith('/admin') && !path.startsWith('/admin/login');
      if (isProtected) return !!auth?.user;
      return true;
    },
  },
};
