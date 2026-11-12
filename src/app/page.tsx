'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { clearSession, readSession, type Session } from '@/lib/session'

const LINKS = [
  { href: '/jobs', label: 'My Jobs', fullOnly: false },
  { href: '/jobs?action=report', label: 'Report Progress', fullOnly: false },
  { href: '/request', label: 'Request Stock / Tools', fullOnly: false },
  { href: '/sage', label: 'Sage', fullOnly: true },
  { href: '/ads', label: 'Ads', fullOnly: true },
  { href: '/lee', label: 'Lee', fullOnly: false },
  { href: '/admin', label: 'Admin', fullOnly: true },
]

export default function Home() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    setSession(readSession())
  }, [])

  const links = LINKS.filter((link) => !link.fullOnly || session?.access === 'full')

  return (
    <main className="min-h-screen bg-[#1a1c1e] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Image
            src="/ags-logo.png"
            alt="AGS Aluminium Glass Services"
            width={220}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-semibold text-white tracking-wide">Workspace</h1>
          {session && <p className="text-gray-400 text-sm mt-2">{session.full_name}</p>}
        </div>

        <div className="space-y-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block w-full bg-white text-gray-900 text-center py-4 rounded-xl font-medium shadow-lg hover:bg-gray-100 transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            clearSession()
            router.replace('/login')
          }}
          className="block w-full text-center mt-8 text-gray-400 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </main>
  )
}
