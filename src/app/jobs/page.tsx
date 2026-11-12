'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadJobs() {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
      setJobs(data || [])
    }
    loadJobs()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">My Jobs</h1>
        <div className="space-y-3">
          {jobs.length === 0 && (
            <p className="text-gray-500 text-center py-8">No jobs yet</p>
          )}
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/report/${job.id}`}
              className="block bg-white p-4 rounded-lg shadow border"
            >
              <div className="font-medium">{job.title}</div>
              <div className="text-sm text-gray-600">{job.customer_name}</div>
              <div className="text-sm text-gray-500">{job.address}</div>
              <div className="mt-2 text-xs inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {job.status}
              </div>
            </Link>
          ))}
        </div>
        <Link href="/" className="block text-center mt-6 text-blue-600">← Back</Link>
      </div>
    </main>
  )
}
