import { SessionUser } from './domain';

declare module 'next-auth' {
  interface Session {
    user: SessionUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    plan: SessionUser['plan'];
    tokens: number;
    githubLinked: boolean;
    githubUsername?: string | null;
  }
}
