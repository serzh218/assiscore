// @vitest-environment jsdom
import React from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect } from 'vitest'
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
  return container
}

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
})
