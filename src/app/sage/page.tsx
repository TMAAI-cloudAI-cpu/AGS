'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Job = {
  id: string
  title: string
  customer_name: string | null
  address: string | null
  status: string | null
}

export default function SagePage() {
  const supabase = createClient()
  const [jobs, setJobs] = useState<Job[]>([])
  const [product, setProduct] = useState<'cloud' | 'pastel'>('cloud')
  const [note, setNote] = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('jobs')
        .select('id,title,customer_name,address,status')
        .order('created_at', { ascending: false })
      if (error) setNote(error.message)
      setJobs(data || [])
    }
    load()
  }, [])

  async function markReady(job: Job) {
    const { error } = await supabase.from('jobs').update({ status: 'ready_to_invoice' }).eq('id', job.id)
    if (error) {
      setNote(error.message)
      return
    }
    setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, status: 'ready_to_invoice' } : item)))
  }

  const ready = jobs.filter((job) => job.status === 'ready_to_invoice' || job.status === 'complete')

  return (
    <main className="min-h-screen bg-[#1a1c1e] p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-1">Sage</h1>
        <p className="text-gray-400 text-sm mb-5">Zelda’s books. Live Sage is not connected yet. Jobs below are from Supabase.</p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setProduct('cloud')}
            className={`rounded-xl border p-3 text-left ${product === 'cloud' ? 'border-white bg-[#25282b]' : 'border-[#3a3d40] bg-[#25282b]'}`}
          >
            <div className="text-sm font-medium text-white">Sage Accounting</div>
            <div className="text-xs text-gray-400 mt-1">Cloud. Contacts, invoices, receipts.</div>
          </button>
          <button
            type="button"
            onClick={() => setProduct('pastel')}
            className={`rounded-xl border p-3 text-left ${product === 'pastel' ? 'border-white bg-[#25282b]' : 'border-[#3a3d40] bg-[#25282b]'}`}
          >
            <div className="text-sm font-medium text-white">Sage Pastel</div>
            <div className="text-xs text-gray-400 mt-1">Desktop. Batch export, not a live API.</div>
          </button>
        </div>

        <div className="bg-[#25282b] border border-[#3a3d40] rounded-xl p-4 text-sm text-gray-300 mb-4">
          {product === 'cloud'
            ? 'Sage Accounting can take customers and sales invoices from a finished job. Payments stay in Sage and show here once the company is linked.'
            : 'Pastel stays on the office PC. Finished jobs will export as a customer and invoice batch for Zelda to import.'}
        </div>

        <h2 className="text-sm text-gray-400 mb-2">Ready to invoice ({ready.length})</h2>
        <div className="space-y-3">
          {jobs.length === 0 && (
            <div className="bg-[#25282b] border border-[#3a3d40] rounded-xl p-8 text-center text-gray-400">
              No jobs yet
            </div>
          )}
          {jobs.map((job) => (
            <div key={job.id} className="bg-[#25282b] border border-[#3a3d40] rounded-xl p-4">
              <div className="font-medium text-white">{job.title}</div>
              <div className="text-sm text-gray-400 mt-1">{job.customer_name}</div>
              <div className="text-sm text-gray-500">{job.address}</div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs px-2.5 py-1 bg-white/10 text-gray-200 rounded-full">{job.status || 'pending'}</span>
                {job.status !== 'ready_to_invoice' && (
                  <button
                    type="button"
                    onClick={() => markReady(job)}
                    className="bg-white text-gray-900 text-sm font-medium px-3 py-2 rounded-lg"
                  >
                    Ready to invoice
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {note && <p className="text-sm text-red-300 mt-4">{note}</p>}
        <Link href="/" className="block text-center mt-8 text-gray-400 hover:text-white">
          ← Back
        </Link>
      </div>
    </main>
  )
}
