import 'server-only'

import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { Router, Request, Response } from 'express'

interface User {
  id: string
  email: string
  hashedPassword: string
}

const router = Router()

const users: User[] = []

function isEmailValid(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  if (!isEmailValid(email)) {
    return res.status(400).json({ message: 'Invalid email format' })
  }

  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' })
  }

  const existingUser = users.find((u) => u.email === email)
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser: User = { id: randomUUID(), email, hashedPassword }
    users.push(newUser)

    return res.status(201).json({ message: 'Registration successful' })
  } catch (_error) {
    return res.status(500).json({ message: 'Failed to register user' })
  }
})

export const authRouter = router
