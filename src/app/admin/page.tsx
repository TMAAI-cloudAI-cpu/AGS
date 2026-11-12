'use client'

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { canonicalCell } from '@/lib/session'

type Staff = {
  id: string
  full_name: string
  cell_number: string
  id_number: string | null
  address: string | null
  access: 'full' | 'staff'
  pin: string
  comments: string | null
}

const empty = {
  full_name: '',
  cell_number: '',
  id_number: '',
  address: '',
  access: 'staff' as 'full' | 'staff',
  pin: '',
  comments: '',
}

export default function AdminPage() {
  const supabase = createClient()
  const [people, setPeople] = useState<Staff[]>([])
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [edit, setEdit] = useState(empty)

  async function load() {
    const { data, error } = await supabase
      .from('staff')
      .select('id,full_name,cell_number,id_number,address,access,pin,comments')
      .order('created_at', { ascending: false })
    if (error) {
      setNote(error.message)
      return
    }
    setNote('')
    setPeople(data || [])
  }

  useEffect(() => {
    void load()
  }, [])

  function set<K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const pin = form.pin.trim()
    if (!/^\d{4,6}$/.test(pin)) {
      setNote('PIN must be 4 to 6 digits.')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('staff').insert({
      full_name: form.full_name.trim(),
      cell_number: canonicalCell(form.cell_number),
      id_number: form.id_number.trim() || null,
      address: form.address.trim() || null,
      access: form.access,
      pin,
      comments: form.comments.trim() || null,
    })
    setLoading(false)
    if (error) {
      setNote(error.message)
      return
    }
    setForm(empty)
    setNote('Saved.')
    await load()
  }

  async function remove(id: string) {
    const { error } = await supabase.from('staff').delete().eq('id', id)
    if (error) {
      setNote(error.message)
      return
    }
    if (editingId === id) setEditingId(null)
    setPeople((current) => current.filter((person) => person.id !== id))
  }

  function startEdit(person: Staff) {
    setEditingId(person.id)
    setEdit({
      full_name: person.full_name,
      cell_number: person.cell_number,
      id_number: person.id_number ?? '',
      address: person.address ?? '',
      access: person.access,
      pin: person.pin,
      comments: person.comments ?? '',
    })
    setNote('')
  }

  function setEditField<K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) {
    setEdit((current) => ({ ...current, [key]: value }))
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault()
    if (!editingId) return
    const pin = edit.pin.trim()
    if (!/^\d{4,6}$/.test(pin)) {
      setNote('PIN must be 4 to 6 digits.')
      return
    }
    setLoading(true)
    const { error } = await supabase
      .from('staff')
      .update({
        full_name: edit.full_name.trim(),
        cell_number: canonicalCell(edit.cell_number),
        id_number: edit.id_number.trim() || null,
        address: edit.address.trim() || null,
        access: edit.access,
        pin,
        comments: edit.comments.trim() || null,
      })
      .eq('id', editingId)
    setLoading(false)
    if (error) {
      setNote(error.message)
      return
    }
    setEditingId(null)
    setNote('Updated.')
    await load()
  }

  return (
    <main className="min-h-screen bg-[#1a1c1e] p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-1">Admin</h1>
        <p className="text-gray-400 text-sm mb-6">Add a person. Full access sees the whole office. Staff see their own jobs.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Name">
            <input
              required
              value={form.full_name}
              onChange={(event) => set('full_name', event.target.value)}
              className={inputClass}
              placeholder="Full name"
            />
          </Field>
          <Field label="Cell number">
            <input
              required
              inputMode="tel"
              value={form.cell_number}
              onChange={(event) => set('cell_number', event.target.value)}
              className={inputClass}
              placeholder="082 000 0000"
            />
          </Field>
          <Field label="ID number">
            <input
              value={form.id_number}
              onChange={(event) => set('id_number', event.target.value)}
              className={inputClass}
              placeholder="ID number"
            />
          </Field>
          <Field label="Address">
            <input
              value={form.address}
              onChange={(event) => set('address', event.target.value)}
              className={inputClass}
              placeholder="Home address"
            />
          </Field>
          <Field label="Access">
            <select
              value={form.access}
              onChange={(event) => set('access', event.target.value as 'full' | 'staff')}
              className={inputClass}
            >
              <option value="full">Full</option>
              <option value="staff">Staff</option>
            </select>
          </Field>
          <Field label="PIN">
            <input
              required
              inputMode="numeric"
              autoComplete="off"
              value={form.pin}
              onChange={(event) => set('pin', event.target.value.replace(/\D/g, '').slice(0, 6))}
              className={inputClass}
              placeholder="4 to 6 digits"
            />
          </Field>
          <Field label="Comments">
            <textarea
              value={form.comments}
              onChange={(event) => set('comments', event.target.value)}
              className={inputClass}
              rows={3}
              placeholder="Site team, wages, notes"
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-gray-900 py-4 rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Add person'}
          </button>
        </form>

        {note && <p className="text-sm text-gray-300 mt-4">{note}</p>}

        <div className="space-y-3 mt-8">
          {people.map((person) => (
            <article key={person.id} className="bg-[#25282b] border border-[#3a3d40] rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-white">{person.full_name}</div>
                  <div className="text-sm text-gray-400 mt-1">{person.cell_number}</div>
                </div>
                <span className="text-xs px-2.5 py-1 bg-white/10 text-gray-200 rounded-full">
                  {person.access === 'full' ? 'Full' : 'Staff'}
                </span>
              </div>
              <dl className="mt-3 space-y-1 text-sm text-gray-400">
                <div>ID {person.id_number || 'not added'}</div>
                <div>{person.address || 'Address not added'}</div>
                <div>PIN {person.pin}</div>
                {person.comments && <div className="text-gray-500">{person.comments}</div>}
              </dl>
              {editingId === person.id ? (
                <form onSubmit={saveEdit} className="mt-4 space-y-3">
                  <Field label="Name">
                    <input required value={edit.full_name} onChange={(event) => setEditField('full_name', event.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Cell number">
                    <input required inputMode="tel" value={edit.cell_number} onChange={(event) => setEditField('cell_number', event.target.value)} className={inputClass} />
                  </Field>
                  <Field label="ID number">
                    <input value={edit.id_number} onChange={(event) => setEditField('id_number', event.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Address">
                    <input value={edit.address} onChange={(event) => setEditField('address', event.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Access">
                    <select value={edit.access} onChange={(event) => setEditField('access', event.target.value as 'full' | 'staff')} className={inputClass}>
                      <option value="full">Full</option>
                      <option value="staff">Staff</option>
                    </select>
                  </Field>
                  <Field label="PIN">
                    <input
                      required
                      inputMode="numeric"
                      autoComplete="off"
                      value={edit.pin}
                      onChange={(event) => setEditField('pin', event.target.value.replace(/\D/g, '').slice(0, 6))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Comments">
                    <textarea value={edit.comments} onChange={(event) => setEditField('comments', event.target.value)} className={inputClass} rows={3} />
                  </Field>
                  <div className="flex gap-2">
                    <button type="submit" disabled={loading} className="flex-1 bg-white text-gray-900 py-3 rounded-xl font-medium disabled:opacity-50">
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="flex-1 border border-[#3a3d40] text-white py-3 rounded-xl">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-3 flex gap-4">
                  <button type="button" onClick={() => startEdit(person)} className="text-sm text-white">
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(person.id)} className="text-sm text-gray-500 hover:text-white">
                    Remove
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>

        <Link href="/" className="block text-center mt-8 text-gray-400 hover:text-white">
          ← Back
        </Link>
      </div>
    </main>
  )
}

const inputClass = 'w-full p-3 bg-[#25282b] border border-[#3a3d40] rounded-xl text-white placeholder-gray-500'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-300 mb-1.5">{label}</span>
      {children}
    </label>
  )
}
