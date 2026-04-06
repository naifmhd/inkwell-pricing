// Full auth with Credentials provider — Node.js runtime only (not middleware)
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authConfig } from './config';
import { getDb } from '@/lib/db/client';
import { getUserByUsername } from '@/lib/db/queries';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const username = credentials?.username as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!username || !password) return null;
        const db = getDb();
        const user = await getUserByUsername(db, username);
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        return { id: String(user.id), name: user.username };
      },
    }),
  ],
});
