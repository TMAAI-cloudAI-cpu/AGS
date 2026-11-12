'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'

export default function ReportForm() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState('in_progress')
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: report, error } = await supabase
      .from('progress_reports')
      .insert({
        job_id: id,
        status,
        notes,
      })
      .select()
      .single()

    if (error) {
      alert('Error saving report')
      setLoading(false)
      return
    }

    for (const photo of photos) {
      const path = `${id}/${Date.now()}-${photo.name}`
      const { error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(path, photo)

      if (!uploadError) {
        await supabase.from('photos').insert({
          job_id: id,
          progress_report_id: report.id,
          storage_path: path,
        })
      }
    }

    setLoading(false)
    router.push('/jobs')
  }

  return (
    <main className="min-h-screen bg-[#1a1c1e] p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-6">Report Progress</h1>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 bg-[#25282b] border border-[#3a3d40] rounded-xl text-white"
            >
              <option value="arrived">Arrived</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting for Material</option>
              <option value="complete">Complete</option>
              <option value="issue">Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-[#25282b] border border-[#3a3d40] rounded-xl text-white placeholder-gray-500"
              rows={4}
              placeholder="What was done / any issues..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Photos</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => setPhotos(Array.from(e.target.files || []))}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white file:text-gray-900"
            />
            {photos.length > 0 && (
              <p className="text-sm text-gray-400 mt-2">{photos.length} photo(s) selected</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-gray-900 py-4 rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Submit Report'}
          </button>
        </form>

        <button onClick={() => router.back()} className="block text-center mt-6 text-gray-400 hover:text-white w-full">
          ← Back
        </button>
      </div>
    </main>
  )
}
