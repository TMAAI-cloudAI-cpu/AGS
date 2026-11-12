'use client'

import { useState } from 'react'
import Link from 'next/link'

const SIZES = [
  { id: '1:1', label: 'Square' },
  { id: '4:5', label: 'Post' },
  { id: '9:16', label: 'Story' },
]

export default function AdsPage() {
  const [photo, setPhoto] = useState<File | null>(null)
  const [aspect, setAspect] = useState('1:1')
  const [note, setNote] = useState('')
  const [image, setImage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    if (!photo || busy) return
    setBusy(true)
    setError('')
    setImage('')
    const body = new FormData()
    body.set('photo', photo)
    body.set('aspect', aspect)
    body.set('note', note)
    try {
      const res = await fetch('/api/ads', { method: 'POST', body })
      const data = (await res.json()) as { image?: string; error?: string }
      if (!res.ok || !data.image) {
        setError(data.error || 'Could not make the ad.')
        return
      }
      setImage(data.image)
    } catch {
      setError('Could not make the ad. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1a1c1e] p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-1">Ads</h1>
        <p className="text-gray-400 text-sm mb-6">Full access only. Start from a real job photo. Nothing is posted.</p>

        <div className="space-y-5">
          <label className="block">
            <span className="block text-sm text-gray-300 mb-1.5">Job photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => {
                setPhoto(event.target.files?.[0] ?? null)
                setImage('')
              }}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white file:text-gray-900"
            />
          </label>

          <div>
            <span className="block text-sm text-gray-300 mb-1.5">Size</span>
            <div className="grid grid-cols-3 gap-2">
              {SIZES.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setAspect(size.id)}
                  className={`rounded-xl border py-3 text-sm ${aspect === size.id ? 'border-white bg-[#25282b] text-white' : 'border-[#3a3d40] text-gray-300'}`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="block text-sm text-gray-300 mb-1.5">What was fitted</span>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="w-full p-3 bg-[#25282b] border border-[#3a3d40] rounded-xl text-white placeholder-gray-500"
              placeholder="Shopfront, Beacon Bay"
            />
          </label>

          <button
            type="button"
            onClick={() => void generate()}
            disabled={!photo || busy}
            className="w-full bg-white text-gray-900 py-4 rounded-xl font-medium disabled:opacity-50"
          >
            {busy ? 'Making the ad...' : 'Make ad'}
          </button>
        </div>

        {error && <p className="text-sm text-red-300 mt-4">{error}</p>}

        {image && (
          <div className="mt-6">
            <img src={image} alt="AGS ad" className="w-full rounded-xl border border-[#3a3d40]" />
            <a href={image} download="ags-ad.jpg" className="block text-center mt-4 text-white">
              Download
            </a>
          </div>
        )}

        <Link href="/" className="block text-center mt-8 text-gray-400 hover:text-white">
          ← Back
        </Link>
      </div>
    </main>
  )
}
