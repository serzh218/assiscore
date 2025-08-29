// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { createRoot } from 'react-dom/client'
import UserMenu from '@/components/UserMenu'
import { signOut } from 'next-auth/react'

vi.mock('next-auth/react', () => ({ signOut: vi.fn() }))

async function renderMenu() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(
    <UserMenu
      user={{}}
      prefix="/en"
      profileLabel="Profile"
      billingLabel="Billing"
      signOutLabel="Sign out"
    />,
  )
  await new Promise((r) => setTimeout(r, 0))
  return container
}

describe('UserMenu', () => {
  it('calls signOut with locale', async () => {
    const c = await renderMenu()
    const buttons = c.querySelectorAll('button')
    buttons[0].click()
    await new Promise((r) => setTimeout(r, 0))
    const btns = c.querySelectorAll('button')
    btns[1].click()
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/en' })
  })
})
