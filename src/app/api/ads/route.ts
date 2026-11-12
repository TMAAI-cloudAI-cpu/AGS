import { readFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export const maxDuration = 60

const SIZES: Record<string, string> = {
  '1:1': '1024x1024',
  '4:5': '1024x1536',
  '9:16': '1024x1536',
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'The OpenAI key is not on this site yet.' }, { status: 500 })
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
  const size = SIZES[aspect]
  if (!size) return NextResponse.json({ error: 'Choose a size.' }, { status: 400 })

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

  const outbound = new FormData()
  outbound.set('model', 'gpt-image-2.5-sunburst')
  outbound.set('prompt', prompt)
  outbound.set('size', size)
  outbound.set('quality', 'medium')
  outbound.append('image[]', photo, photo.name || 'job.jpg')
  outbound.append('image[]', new Blob([logo], { type: 'image/png' }), 'ags-logo.png')

  const res = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: outbound,
  })
  const body = (await res.json().catch(() => null)) as {
    error?: { message?: string }
    data?: { b64_json?: string }[]
  } | null
  if (!res.ok) {
    return NextResponse.json(
      { error: body?.error?.message || `OpenAI could not make the ad (${res.status}).` },
      { status: 502 },
    )
  }
  const image = body?.data?.[0]?.b64_json
  if (!image) return NextResponse.json({ error: 'OpenAI returned no image.' }, { status: 502 })
  return NextResponse.json({ image: `data:image/png;base64,${image}` })
}
