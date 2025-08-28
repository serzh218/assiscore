import type { ReactNode } from 'react'
import '@/styles/animations.css'

export default function AppLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1280px] px-4 py-8">{children}</div>
}
