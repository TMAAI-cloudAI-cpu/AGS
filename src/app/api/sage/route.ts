import { NextResponse } from 'next/server'

const BASE = (process.env.SAGE_BASE_URL || 'https://accounting.sageone.co.za/api/2.0.0').replace(/\/$/, '')

async function sageGet(path: string, companyId?: string) {
  const key = process.env.SAGE_API_KEY
  if (!key) return { error: 'SAGE_API_KEY is not set on this site.' as const }

  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('apikey', key)
  if (companyId) url.searchParams.set('CompanyId', companyId)

  const res = await fetch(url, { cache: 'no-store' })
  const text = await res.text()
  let body: unknown = text
  try {
    body = JSON.parse(text)
  } catch {
    // leave as text
  }
  if (!res.ok) return { error: `Sage ${res.status}`, body }
  return { data: body }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'status'
  const companyId = process.env.SAGE_COMPANY_ID || searchParams.get('companyId') || undefined

  if (action === 'status') {
    if (!process.env.SAGE_API_KEY) {
      return NextResponse.json({ connected: false, message: 'Add SAGE_API_KEY in Vercel to connect.' })
    }
    const companies = await sageGet('/Company/Get')
    if ('error' in companies) {
      return NextResponse.json({ connected: false, message: companies.error, detail: companies.body }, { status: 502 })
    }
    return NextResponse.json({ connected: true, companies: companies.data, companyId: companyId || null })
  }

  if (action === 'customers') {
    const result = await sageGet('/Customer/Get', companyId)
    if ('error' in result) return NextResponse.json(result, { status: 502 })
    return NextResponse.json(result.data)
  }

  if (action === 'invoices') {
    const result = await sageGet('/TaxInvoice/Get', companyId)
    if ('error' in result) return NextResponse.json(result, { status: 502 })
    return NextResponse.json(result.data)
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
}
