'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RequestPage() {
  const router = useRouter()
  const supabase = createClient()
  const [item, setItem] = useState('')
  const [quantity, setQuantity] = useState('')
  const [urgency, setUrgency] = useState('normal')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('stock_requests').insert({
      item,
      quantity,
      urgency,
      notes,
    })

    setLoading(false)
    if (error) {
      alert('Error submitting request')
    } else {
      router.push('/')
    }
  }

  return (
    <main className="min-h-screen bg-[#1a1c1e] p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-6">Request Stock / Tools</h1>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Item</label>
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="w-full p-3 bg-[#25282b] border border-[#3a3d40] rounded-xl text-white placeholder-gray-500"
              placeholder="e.g. Aluminium profile, glass, drill..."
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Quantity</label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-3 bg-[#25282b] border border-[#3a3d40] rounded-xl text-white placeholder-gray-500"
              placeholder="e.g. 6m, 2 sheets, 1"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Urgency</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full p-3 bg-[#25282b] border border-[#3a3d40] rounded-xl text-white"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-[#25282b] border border-[#3a3d40] rounded-xl text-white placeholder-gray-500"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-gray-900 py-4 rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Submit Request'}
          </button>
        </form>

        <button onClick={() => router.back()} className="block text-center mt-6 text-gray-400 hover:text-white w-full">
          ← Back
        </button>
      </div>
    </main>
  )
}
