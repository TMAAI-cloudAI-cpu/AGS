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
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Request Stock / Tools</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Item</label>
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="e.g. Aluminium profile, glass, drill..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="e.g. 6m, 2 sheets, 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Urgency</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-4 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Submit Request'}
          </button>
        </form>

        <button onClick={() => router.back()} className="block text-center mt-4 text-blue-600 w-full">
          ← Back
        </button>
      </div>
    </main>
  )
}
