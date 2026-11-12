import { Suspense } from 'react'
import JobsList from './jobs-list'

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1c1e] p-4 text-white">Loading...</div>}>
      <JobsList />
    </Suspense>
  )
}
