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
    <main className="min-h-screen bg-[#1a1c1e] p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-6">My Jobs</h1>
        <div className="space-y-3">
          {jobs.length === 0 && (
            <div className="bg-[#25282b] border border-[#3a3d40] rounded-xl p-8 text-center text-gray-400">
              No jobs yet
            </div>
          )}
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/report/${job.id}`}
              className="block bg-[#25282b] border border-[#3a3d40] p-4 rounded-xl hover:border-gray-500 transition"
            >
              <div className="font-medium text-white">{job.title}</div>
              <div className="text-sm text-gray-400 mt-1">{job.customer_name}</div>
              <div className="text-sm text-gray-500">{job.address}</div>
              <div className="mt-3 text-xs inline-block px-2.5 py-1 bg-white/10 text-gray-200 rounded-full">
                {job.status}
              </div>
            </Link>
          ))}
        </div>
        <Link href="/" className="block text-center mt-8 text-gray-400 hover:text-white">
          ← Back
        </Link>
      </div>
    </main>
  )
}
