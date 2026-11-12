import { readFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export const maxDuration = 60

const ASPECTS = new Set(['1:1', '4:5', '9:16'])

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'The Gemini key is not on this site yet.' }, { status: 500 })
  }

  const form = await request.formData()
  const photo = form.get('photo')
  const aspect = String(form.get('aspect') || '1:1')
  const note = String(form.get('note') || '').slice(0, 500)
  if (!(photo instanceof File)) {
    return NextResponse.json({ error: 'Choose a job photo first.' }, { status: 400 })
  }
  if (!photo.type.startsWith('image/') || photo.size > 4_000_000) {
    return NextResponse.json({ error: 'Use a photo under 4 MB.' }, { status: 400 })
  }
  if (!ASPECTS.has(aspect)) {
    return NextResponse.json({ error: 'Choose a size.' }, { status: 400 })
  }

  const photoBytes = Buffer.from(await photo.arrayBuffer()).toString('base64')
  const logo = await readFile(path.join(process.cwd(), 'public', 'ags-logo.png'))
  const prompt = [
    'Make a social media advertisement for AGS Aluminium Glass Services in East London, South Africa.',
    'The first image is a real job photo. Keep that installation, the building, and the materials as they are. Do not replace them with a different window, shower, or shopfront.',
    'The second image is the company logo. Place it small and clear, without covering the work.',
    'The photo stays the hero. A short headline may say: Aluminium and glass, fitted properly.',
    'No fake reviews, no prices, no phone numbers, and no extra people.',
    note ? `Job note: ${note}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const headers = {
    'Content-Type': 'application/json',
    'x-goog-api-key': apiKey,
    'Api-Revision': '2026-05-20',
  }
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'gemini-nano-banana-2.1',
      input: [
        { type: 'text', text: prompt },
        { type: 'image', mime_type: photo.type, data: photoBytes },
        { type: 'image', mime_type: 'image/png', data: logo.toString('base64') },
      ],
      response_format: {
        type: 'image',
        mime_type: 'image/png',
        aspect_ratio: aspect,
        image_size: '1K',
      },
    }),
  })

  let body = (await res.json().catch(() => null)) as Record<string, unknown> | null
  if (!res.ok) {
    const message = typeof body?.error === 'object' && body.error && 'message' in body.error
      ? String((body.error as { message?: string }).message)
      : `Gemini could not make the ad (${res.status}).`
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const id = String(body?.id || (body?.interaction as { id?: string } | undefined)?.id || '')
  for (let attempt = 0; attempt < 8 && id && !pickImage(body); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const next = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions/${id}`, { headers })
    body = (await next.json().catch(() => null)) as Record<string, unknown> | null
  }

  const image = pickImage(body)
  if (!image) {
    return NextResponse.json({ error: 'Gemini returned no image.' }, { status: 502 })
  }
  return NextResponse.json({ image: `data:${image.mime};base64,${image.data}` })
}

function pickImage(body: Record<string, unknown> | null) {
  if (!body) return null
  const copy: Record<string, unknown> = { ...body }
  delete copy.input
  if (copy.interaction && typeof copy.interaction === 'object') {
    const interaction = { ...(copy.interaction as Record<string, unknown>) }
    delete interaction.input
    copy.interaction = interaction
  }
  return findImage(copy.interaction) || findImage(copy.steps) || findImage(copy.candidates) || findImage(copy.output_image) || findImage(copy)
}

function findImage(value: unknown): { data: string; mime: string } | null {
  if (!value || typeof value !== 'object') return null
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findImage(item)
      if (found) return found
    }
    return null
  }
  const record = value as Record<string, unknown>
  const mime = String(record.mime_type || record.mimeType || '')
  if (typeof record.data === 'string' && record.data.length > 500 && (mime.startsWith('image/') || record.type === 'image')) {
    return { data: record.data, mime: mime || 'image/png' }
  }
  const inline = record.inlineData || record.inline_data
  if (inline && typeof inline === 'object') {
    const inner = inline as Record<string, unknown>
    const innerMime = String(inner.mimeType || inner.mime_type || '')
    if (typeof inner.data === 'string' && inner.data.length > 500) {
      return { data: inner.data, mime: innerMime || 'image/png' }
    }
  }
  for (const child of Object.values(record)) {
    const found = findImage(child)
    if (found) return found
  }
  return null
}
