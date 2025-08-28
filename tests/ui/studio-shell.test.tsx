/** @vitest-environment jsdom */
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, test, expect } from 'vitest'
import { StudioShell } from '@/app/[locale]/(app)/projects/[id]/studio/shell'

beforeEach(() => {
  localStorage.clear()
})

test('renders panels and resize handles', () => {
  render(<StudioShell left={<div />} center={<div />} right={<div />} />)
  expect(screen.getAllByTestId('resize-handle').length).toBe(2)
})

test('stores default layout to localStorage', () => {
  render(<StudioShell left={<div />} center={<div />} right={<div />} />)
  expect(localStorage.getItem('studio:sizes')).toBe(JSON.stringify([20, 60, 20]))
})

test('restores layout from localStorage', () => {
  localStorage.setItem('studio:sizes', JSON.stringify([30, 40, 30]))
  render(<StudioShell left={<div />} center={<div />} right={<div />} />)
  expect(localStorage.getItem('studio:sizes')).toBe(JSON.stringify([30, 40, 30]))
})
