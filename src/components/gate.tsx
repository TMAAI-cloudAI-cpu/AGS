'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { readSession } from '@/lib/session'

const FULL_ONLY = ['/admin', '/sage']

export function Gate({ children }: { children: ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const session = readSession()
    if (path === '/login') {
      if (session) router.replace('/')
      setReady(true)
      return
    }
    if (!session) {
      setReady(false)
      router.replace('/login')
      return
    }
    if (session.access !== 'full' && FULL_ONLY.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
      router.replace('/')
      setReady(false)
      return
    }
    setReady(true)
  }, [path, router])

  if (!ready) return <main className="min-h-screen bg-[#1a1c1e]" />
  return children
}
