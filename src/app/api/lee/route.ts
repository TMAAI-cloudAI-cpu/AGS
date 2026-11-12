import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type Turn = { role: 'user' | 'assistant'; content: string }

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { messages?: Turn[] } | null
  const messages = (body?.messages ?? [])
    .slice(-12)
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: String(message.content ?? '').slice(0, 2000),
    }))
    .filter((message) => message.content.trim())

  if (!messages.length || messages[messages.length - 1]?.role !== 'user') {
    return NextResponse.json({ error: 'Send a message first.' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  let snapshot = 'No workspace data loaded.'
  if (url && key) {
    const supabase = createClient(url, key)
    const [{ data: jobs }, { data: requests }] = await Promise.all([
      supabase.from('jobs').select('title,customer_name,address,status').order('created_at', { ascending: false }).limit(20),
      supabase.from('stock_requests').select('item,quantity,urgency,status').order('created_at', { ascending: false }).limit(20),
    ])
    const jobLines = (jobs ?? []).map((job) => `${job.title} | ${job.customer_name ?? ''} | ${job.status ?? 'pending'}`).join('\n') || 'none'
    const stockLines = (requests ?? []).map((item) => `${item.item} | ${item.quantity ?? ''} | ${item.urgency ?? ''} | ${item.status ?? ''}`).join('\n') || 'none'
    snapshot = `Jobs:\n${jobLines}\nStock requests:\n${stockLines}`
  }

  const deepseekKey = process.env.DEEPSEEK_API_KEY
  const xaiKey = process.env.XAI_API_KEY
  const apiKey = deepseekKey || xaiKey
  if (!apiKey) {
    return NextResponse.json({
      text: `I can see the AGS workspace, but the model is not switched on for this site yet.\n\n${snapshot}`,
    })
  }

  const base = (process.env.DEEPSEEK_BASE_URL || (deepseekKey ? 'https://api.deepseek.com' : 'https://api.x.ai/v1')).replace(/\/$/, '')
  const model = deepseekKey ? 'deepseek-chat' : 'grok-4.5'
  const endpoint = base.endsWith('/v1') ? `${base}/chat/completions` : `${base}/chat/completions`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            'You are Lee, the office assistant for Aluminium Glass Services in East London. Be short and practical. Do not invent jobs or invoices that are not in the snapshot. Sage Accounting can sync contacts and invoices. Sage Pastel is a desktop batch export. Stock requests do not post to Sage.\n\n' +
            snapshot,
        },
        ...messages,
      ],
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: `Lee could not reply (${res.status}).` }, { status: 502 })
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const text = data.choices?.[0]?.message?.content?.trim()
  if (!text) return NextResponse.json({ error: 'Lee returned an empty reply.' }, { status: 502 })
  return NextResponse.json({ text })
}
