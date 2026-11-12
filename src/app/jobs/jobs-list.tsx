'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { readSession, type Session } from '@/lib/session'

type Person = { id: string; full_name: string }
type Job = {
  id: string
  title: string | null
  job_number: string | null
  address: string | null
  description: string | null
  status: string | null
  staff_id: string | null
  customer_name: string | null
}

const empty = { job_number: '', staff_id: '', address: '', description: '' }

export default function JobsList() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const isReportMode = searchParams.get('action') === 'report'
  const [session, setSession] = useState<Session | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')

  const full = session?.access === 'full'

  async function load(current: Session | null) {
    const [{ data: jobData, error: jobError }, { data: staffData }] = await Promise.all([
      supabase.from('jobs').select('id,title,job_number,address,description,status,staff_id,customer_name').order('created_at', { ascending: false }),
      supabase.from('staff').select('id,full_name').order('full_name'),
    ])
    if (jobError) {
      setNote(jobError.message.includes('recursion') || jobError.message.includes('job_number')
        ? 'Jobs need a one-time update in Supabase before they can be added.'
        : jobError.message)
      setJobs([])
    } else {
      const rows = (jobData || []) as Job[]
      setJobs(current && current.access !== 'full' ? rows.filter((job) => job.staff_id === current.id) : rows)
      setNote('')
    }
    setPeople(staffData || [])
  }

  useEffect(() => {
    const current = readSession()
    setSession(current)
    void load(current)
  }, [])

  async function createJob(event: FormEvent) {
    event.preventDefault()
    const jobNumber = form.job_number.trim()
    if (!jobNumber || !form.staff_id || !form.address.trim() || !form.description.trim()) {
      setNote('Job number, staff, address, and description are required.')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('jobs').insert({
      title: jobNumber,
      job_number: jobNumber,
      staff_id: form.staff_id,
      address: form.address.trim(),
      description: form.description.trim(),
      status: 'pending',
    })
    setLoading(false)
    if (error) {
      setNote(error.message)
      return
    }
    setForm(empty)
    setOpen(false)
    setNote('Job added.')
    await load(session)
  }

  async function remove(id: string) {
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (error) {
      setNote(error.message)
      return
    }
    setConfirmId(null)
    setJobs((current) => current.filter((job) => job.id !== id))
  }

  function nameFor(id: string | null) {
    return people.find((person) => person.id === id)?.full_name
  }

  return (
    <main className="min-h-screen bg-[#1a1c1e] p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-2">
          {isReportMode ? 'Select Job to Report' : 'My Jobs'}
        </h1>
        {isReportMode && (
          <p className="text-gray-400 text-sm mb-6">Choose a job to submit a progress report</p>
        )}

        {full && !isReportMode && (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="w-full bg-white text-gray-900 py-4 rounded-xl font-medium mb-4"
          >
            {open ? 'Close' : 'Create job'}
          </button>
        )}

        {open && full && !isReportMode && (
          <form onSubmit={createJob} className="space-y-4 mb-6">
            <label className="block">
              <span className="block text-sm text-gray-300 mb-1.5">Job number</span>
              <input
                value={form.job_number}
                onChange={(event) => setForm({ ...form, job_number: event.target.value })}
                className={inputClass}
                placeholder="Same as the invoice number"
              />
            </label>
            <label className="block">
              <span className="block text-sm text-gray-300 mb-1.5">Staff member</span>
              <select
                value={form.staff_id}
                onChange={(event) => setForm({ ...form, staff_id: event.target.value })}
                className={inputClass}
              >
                <option value="">Select</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>{person.full_name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm text-gray-300 mb-1.5">Address</span>
              <input
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                className={inputClass}
                placeholder="Site address"
              />
            </label>
            <label className="block">
              <span className="block text-sm text-gray-300 mb-1.5">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className={inputClass}
                rows={3}
                placeholder="What has to be done"
              />
            </label>
            <button type="submit" disabled={loading} className="w-full bg-white text-gray-900 py-3 rounded-xl font-medium disabled:opacity-50">
              {loading ? 'Saving...' : 'Save job'}
            </button>
          </form>
        )}

        {note && <p className="text-sm text-gray-300 mb-4">{note}</p>}

        <div className="space-y-3">
          {jobs.length === 0 && (
            <div className="bg-[#25282b] border border-[#3a3d40] rounded-xl p-8 text-center text-gray-400">
              No jobs yet
            </div>
          )}
          {jobs.map((job) => {
            const number = job.job_number || job.title
            return (
              <article key={job.id} className="bg-[#25282b] border border-[#3a3d40] p-4 rounded-xl">
                <Link href={`/report/${job.id}`} className="block">
                  <div className="font-medium text-white">{number}</div>
                  <div className="text-sm text-gray-400 mt-1">{nameFor(job.staff_id) || job.customer_name}</div>
                  <div className="text-sm text-gray-500">{job.address}</div>
                  {job.description && <div className="text-sm text-gray-400 mt-2">{job.description}</div>}
                  <div className="mt-3 text-xs inline-block px-2.5 py-1 bg-white/10 text-gray-200 rounded-full">
                    {job.status}
                  </div>
                </Link>
                {full && !isReportMode && (
                  confirmId === job.id ? (
                    <div className="mt-3 flex gap-3">
                      <button type="button" onClick={() => remove(job.id)} className="text-sm text-white">Delete job</button>
                      <button type="button" onClick={() => setConfirmId(null)} className="text-sm text-gray-500">Cancel</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setConfirmId(job.id)} className="mt-3 text-sm text-gray-500 hover:text-white">
                      Delete
                    </button>
                  )
                )}
              </article>
            )
          })}
        </div>
        <Link href="/" className="block text-center mt-8 text-gray-400 hover:text-white">
          ← Back
        </Link>
      </div>
    </main>
  )
}

const inputClass = 'w-full p-3 bg-[#25282b] border border-[#3a3d40] rounded-xl text-white placeholder-gray-500'
