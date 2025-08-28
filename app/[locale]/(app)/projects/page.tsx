'use client'

import React from 'react'
import { ProjectsList, Project } from './ProjectsList'

const defaultProjects: Project[] = [
  { id: '1', name: 'Project A', updatedAt: '2024-01-01', owner: 'me', public: false },
  { id: '2', name: 'Project B', updatedAt: '2024-02-15', owner: 'me', public: true },
  { id: '3', name: 'Cool Stuff', updatedAt: '2024-03-10', owner: 'alice', public: true },
]

export default function ProjectsPage() {
  return <ProjectsList projects={defaultProjects} />
}
