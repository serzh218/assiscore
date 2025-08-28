/** @vitest-environment jsdom */
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect } from 'vitest'
import { Button } from '@/components/ui'
import { ThemeToggle } from '@/components/theme-toggle'
import { ThemeProvider } from 'next-themes'

describe('ui states', () => {
  test('button receives focus with keyboard', async () => {
    render(<Button>Click</Button>)
    const btn = screen.getByRole('button')
    await userEvent.tab()
    expect(document.activeElement).toBe(btn)
  })

  test('disabled button has aria-disabled', () => {
    render(<Button disabled>Off</Button>)
    const btn = screen.getByRole('button', { name: 'Off' })
    expect(btn.hasAttribute('disabled')).toBe(true)
    expect(btn.getAttribute('aria-disabled')).toBe('true')
  })

  test('theme toggle switches document class', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
    })
    render(
      <ThemeProvider attribute="class">
        <ThemeToggle />
      </ThemeProvider>,
    )
    const toggle = screen.getByRole('button', { name: /toggle theme/i })
    await userEvent.click(toggle)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
