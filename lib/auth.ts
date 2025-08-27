import { prisma } from '@/lib/db';
import { Plan } from '@prisma/client';
import bcrypt from 'bcrypt';
import { type NextAuthOptions, getServerSession as getNextServerSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { SessionUser } from '@/types/domain';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          plan: user.plan,
          tokens: user.tokens,
        } as SessionUser;
      },
    }),
  ],
  pages: { signIn: '/auth/sign-in' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id;
        token.plan = (user as any).plan;
        token.tokens = (user as any).tokens;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId as string;
        (session.user as any).plan = token.plan as Plan;
        (session.user as any).tokens = token.tokens as number;
      }
      return session;
    },
  },
};

export const getServerSession = () => getNextServerSession(authOptions);

export const getCurrentUser = async (): Promise<SessionUser | null> => {
  const session = await getServerSession();
  if (!session?.user) return null;
  const { id, email, name, plan, tokens } = session.user as SessionUser;
  return { id, email, name, plan, tokens };
};
