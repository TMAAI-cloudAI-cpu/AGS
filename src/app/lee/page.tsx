'use client'

import { useState } from 'react'
import Link from 'next/link'

type Turn = { role: 'user' | 'assistant'; content: string }

const STARTERS = ['Which jobs are still open?', 'What should Zelda check?', 'Any stock requests waiting?']

export default function LeePage() {
  const [messages, setMessages] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function send(text: string) {
    const content = text.trim()
    if (!content || busy) return
    const next = [...messages, { role: 'user' as const, content }]
    setMessages(next)
    setDraft('')
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/lee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-12) }),
      })
      const body = (await res.json()) as { text?: string; error?: string }
      if (!res.ok || !body.text) {
        setError(body.error || 'Lee could not reply.')
        return
      }
      setMessages((current) => [...current, { role: 'assistant', content: body.text! }])
    } catch {
      setError('Lee could not reply. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1a1c1e] p-4">
      <div className="max-w-md mx-auto flex flex-col min-h-[calc(100vh-2rem)]">
        <h1 className="text-2xl font-semibold text-white">Lee</h1>
        <p className="text-gray-400 text-sm mt-1 mb-4">Office assistant. Ask about jobs, stock, or the books.</p>

        <div className="flex-1 space-y-3">
          {messages.length === 0 &&
            STARTERS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => send(prompt)}
                className="block w-full text-left bg-[#25282b] border border-[#3a3d40] rounded-xl px-4 py-3 text-white"
              >
                {prompt}
              </button>
            ))}
          {messages.map((message, index) => (
            <div key={index} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <p
                className={
                  'max-w-[85%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ' +
                  (message.role === 'user' ? 'bg-white text-gray-900' : 'bg-[#25282b] border border-[#3a3d40] text-white')
                }
              >
                {message.content}
              </p>
            </div>
          ))}
          {busy && <p className="text-sm text-gray-500">Lee is writing…</p>}
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>

        <form
          className="mt-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            void send(draft)
          }}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask Lee"
            className="flex-1 p-3 bg-[#25282b] border border-[#3a3d40] rounded-xl text-white placeholder-gray-500"
          />
          <button type="submit" disabled={busy || !draft.trim()} className="bg-white text-gray-900 font-medium px-4 rounded-xl disabled:opacity-50">
            Send
          </button>
        </form>
        <Link href="/" className="block text-center mt-6 text-gray-400 hover:text-white">
          ← Back
        </Link>
      </div>
    </main>
  )
}
