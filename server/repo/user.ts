import { Prisma, type User } from '@prisma/client';
import { prisma } from '@/lib/db';
import type { Plan, UserDTO } from '@/types/domain';

const toUserDTO = (user: User): UserDTO => ({
  id: user.id,
  email: user.email ?? undefined,
  name: user.name ?? undefined,
  plan: user.plan,
  tokens: user.tokens,
  githubLinked: user.githubLinked,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export async function getUserById(id: string): Promise<UserDTO | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toUserDTO(user) : null;
}

export async function getUserByEmail(email: string): Promise<UserDTO | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  return user ? toUserDTO(user) : null;
}

export async function createUser({
  email,
  passwordHash,
  name,
}: {
  email: string;
  passwordHash?: string;
  name?: string;
}): Promise<UserDTO> {
  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      name,
    },
  });
  return toUserDTO(user);
}

export async function updateUserPlan(id: string, plan: Plan): Promise<UserDTO | null> {
  try {
    const user = await prisma.user.update({ where: { id }, data: { plan } });
    return toUserDTO(user);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return null;
    }
    throw e;
  }
}

export async function updateUserTokens(id: string, delta: number): Promise<UserDTO | null> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { tokens: { increment: delta } },
    });
    return toUserDTO(user);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return null;
    }
    throw e;
  }
}

export async function linkGithub(id: string, linked: boolean): Promise<UserDTO | null> {
  try {
    const user = await prisma.user.update({ where: { id }, data: { githubLinked: linked } });
    return toUserDTO(user);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return null;
    }
    throw e;
  }
}

export async function isPro(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
  return user?.plan === 'PRO';
}
