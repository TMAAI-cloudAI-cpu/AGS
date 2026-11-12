'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { canonicalCell, writeSession, type Access } from '@/lib/session'

export default function LoginPage() {
  const router = useRouter()
  const [cell, setCell] = useState('')
  const [pin, setPin] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const cellNumber = canonicalCell(cell)
    const pinCode = pin.trim()
    if (cellNumber.length < 10 || !/^\d{4,6}$/.test(pinCode)) {
      setNote('Enter the cell number and the PIN.')
      return
    }
    setLoading(true)
    setNote('')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('staff')
      .select('id,full_name,cell_number,access,pin')
      .eq('pin', pinCode)
    setLoading(false)
    if (error) {
      setNote(error.message.includes('staff') ? 'The staff list is not ready yet.' : 'Could not sign in. Try again.')
      return
    }
    const match = (data ?? []).find(
      (person) => canonicalCell(person.cell_number) === cellNumber && person.pin === pinCode,
    )
    if (!match || (match.access !== 'full' && match.access !== 'staff')) {
      setNote('That cell number or PIN is not recognised.')
      return
    }
    writeSession({
      id: match.id,
      full_name: match.full_name,
      cell_number: match.cell_number,
      access: match.access as Access,
    })
    router.replace('/')
  }

  return (
    <main className="min-h-screen bg-[#1a1c1e] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Image src="/ags-logo.png" alt="AGS Aluminium Glass Services" width={220} height={80} className="mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-white tracking-wide">Sign in</h1>
          <p className="text-gray-400 text-sm mt-2">Cell number and PIN</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            inputMode="tel"
            autoComplete="username"
            value={cell}
            onChange={(event) => setCell(event.target.value)}
            className="w-full p-3 bg-[#25282b] border border-[#3a3d40] rounded-xl text-white placeholder-gray-500"
            placeholder="073 000 0000"
          />
          <input
            inputMode="numeric"
            autoComplete="current-password"
            type="password"
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full p-3 bg-[#25282b] border border-[#3a3d40] rounded-xl text-white placeholder-gray-500"
            placeholder="PIN"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-gray-900 py-4 rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        {note && <p className="text-sm text-gray-300 text-center mt-4">{note}</p>}
      </div>
    </main>
  )
}
