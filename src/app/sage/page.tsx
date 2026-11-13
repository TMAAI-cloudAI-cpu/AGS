'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Status = {
  connected?: boolean
  message?: string
  companies?: unknown
  companyId?: string | null
  detail?: unknown
}

export default function SagePage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [invoices, setInvoices] = useState<unknown>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/sage?action=status')
      const body = (await res.json()) as Status
      setStatus(body)
      if (body.connected) {
        const inv = await fetch('/api/sage?action=invoices')
        setInvoices(await inv.json())
      }
    } catch {
      setError('Could not reach Sage.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1a1c1e] p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-1">Sage</h1>
        <p className="text-gray-400 text-sm mb-5">Sage Online Accountant. Live connection.</p>

        <div className="bg-[#25282b] border border-[#3a3d40] rounded-xl p-4 mb-4">
          {busy && <p className="text-sm text-gray-400">Checking Sage…</p>}
          {!busy && status?.connected && (
            <p className="text-sm text-emerald-300">Connected{status.companyId ? ` · company ${status.companyId}` : ''}.</p>
          )}
          {!busy && status && !status.connected && (
            <p className="text-sm text-amber-200">{status.message || 'Not connected yet.'}</p>
          )}
          {error && <p className="text-sm text-red-300 mt-2">{error}</p>}
        </div>

        {status?.connected && (
          <div className="bg-[#25282b] border border-[#3a3d40] rounded-xl p-4 mb-4">
            <h2 className="text-sm text-gray-400 mb-2">Recent invoices</h2>
            <pre className="text-xs text-gray-200 whitespace-pre-wrap break-words max-h-80 overflow-auto">
              {JSON.stringify(invoices, null, 2)}
            </pre>
          </div>
        )}

        {!status?.connected && (
          <div className="bg-[#25282b] border border-[#3a3d40] rounded-xl p-4 text-sm text-gray-300">
            Add <span className="text-white">SAGE_API_KEY</span> in Vercel (Project → Settings → Environment Variables), then redeploy.
            Optional: <span className="text-white">SAGE_COMPANY_ID</span> if he has more than one company.
          </div>
        )}

        <button type="button" onClick={() => void load()} className="mt-4 w-full bg-white text-gray-900 font-medium py-3 rounded-xl">
          Refresh
        </button>
        <Link href="/" className="block text-center mt-8 text-gray-400 hover:text-white">
          ← Back
        </Link>
      </div>
    </main>
  )
}
