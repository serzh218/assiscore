import 'server-only'

import { Plan } from '@prisma/client'
// eslint-disable-next-line no-restricted-imports
import bcrypt from 'bcryptjs'
import { type NextAuthOptions, getServerSession as getNextServerSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'

import { prisma } from '@/lib/db'
import { SessionUser } from '@/types/domain'

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
        const email = credentials?.email
        const password = credentials?.password
        if (!email || !password) return null
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) return null
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null
        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          plan: user.plan,
          tokens: user.tokens,
          githubLinked: user.githubLinked,
          githubUsername: user.githubUsername ?? undefined,
        } as SessionUser
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: { signIn: '/auth/signin' },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        const gh = profile as any
        const email = gh?.email as string | undefined
        let dbUser = email ? await prisma.user.findUnique({ where: { email } }) : null
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email,
              name: gh?.name ?? gh?.login,
              githubLinked: true,
              githubUsername: gh?.login,
            },
          })
        } else {
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: { githubLinked: true, githubUsername: gh?.login },
          })
        }
        ;(user as any).id = dbUser.id
        ;(user as any).plan = dbUser.plan
        ;(user as any).tokens = dbUser.tokens
        ;(user as any).githubLinked = dbUser.githubLinked
        ;(user as any).githubUsername = dbUser.githubUsername
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id
        token.plan = (user as any).plan
        token.tokens = (user as any).tokens
        token.githubLinked = (user as any).githubLinked
        token.githubUsername = (user as any).githubUsername
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.userId as string
        ;(session.user as any).plan = token.plan as Plan
        ;(session.user as any).tokens = token.tokens as number
        ;(session.user as any).githubLinked = token.githubLinked as boolean
        ;(session.user as any).githubUsername = token.githubUsername as string | undefined
      }
      return session
    },
  },
}

export const getServerSession = () => getNextServerSession(authOptions)

export const getCurrentUser = async (): Promise<SessionUser | null> => {
  const session = await getServerSession()
  if (!session?.user) return null
  const { id, email, name, plan, tokens, githubLinked, githubUsername } =
    session.user as SessionUser
  return { id, email, name, plan, tokens, githubLinked, githubUsername }
}
