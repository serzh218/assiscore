'use client'
import * as React from 'react'

export function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = React.useState<T>(initial)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) setState(JSON.parse(raw))
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  React.useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {}
  }, [key, state])
  return [state, setState] as const
}
