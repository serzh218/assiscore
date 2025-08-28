'use client'
import { useEffect, useState } from 'react'

export interface UsageData {
  planCode: string
  quotas: {
    tokens: { remaining: number; limit: number }
    privateProjects: { remaining: number; limit: number }
  }
  periodEnd: string | null
}

export function useUsage() {
  const [data, setData] = useState<UsageData | null>(null)
  useEffect(() => {
    let mounted = true
    fetch('/api/billing/usage')
      .then((r) => r.json())
      .then((d) => {
        if (mounted) setData(d)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])
  return data
}
