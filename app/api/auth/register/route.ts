import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { BadRequestError } from '@/lib/errors'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()
    if (!email || !password) {
      throw new BadRequestError('Email and password are required')
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { message: 'Пользователь с такой почтой уже существует.' },
        { status: 409 },
      )
    }

    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        plan: 'FREE',
        tokens: 500,
      },
      select: { id: true },
    })

    // TODO: rate limit
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof BadRequestError ? err.message : 'Bad Request'
    return NextResponse.json({ message }, { status: 400 })
  }
}
