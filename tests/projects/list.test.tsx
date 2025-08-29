// @vitest-environment jsdom
import React from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import projectsEn from '@/i18n/en/projects.json'
import { ProjectsList, Project } from '@/app/[locale]/(app)/projects/ProjectsList'

async function render(projects: Project[]) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(
    <NextIntlClientProvider locale="en" messages={{ projects: projectsEn }}>
      <ProjectsList projects={projects} />
    </NextIntlClientProvider>,
  )
  await new Promise((r) => setTimeout(r, 0))
  await new Promise((r) => setTimeout(r, 0))
  return container
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ProjectsList', () => {
  it('renders projects', async () => {
    const c = await render([
      { id: '1', name: 'One', updatedAt: '2024-01-01', owner: 'me', public: true },
    ])
    expect(c.textContent).toContain('One')
  })
  it('shows empty state', async () => {
    const c = await render([])
    expect(c.textContent).toContain('No projects yet')
  })
  it('shows paywall badge for private project', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        planCode: 'FREE',
        quotas: {
          tokens: { remaining: 100, limit: 100 },
          privateProjects: { remaining: 0, limit: 0 },
        },
        periodEnd: null,
      }),
    } as any)
    const c = await render([
      { id: '1', name: 'Private', updatedAt: '2024-01-01', owner: 'me', public: false },
    ])
    expect(c.textContent).toContain('Pro/Team only')
  })
})
