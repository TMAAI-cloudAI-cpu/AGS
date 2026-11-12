export type Access = 'full' | 'staff'

export type Session = {
  id: string
  full_name: string
  cell_number: string
  access: Access
}

const KEY = 'ags-session'

export function canonicalCell(value: string) {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('27') && digits.length === 11) digits = `0${digits.slice(2)}`
  return digits
}

export function readSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as Session
    if (!session?.id || (session.access !== 'full' && session.access !== 'staff')) return null
    return session
  } catch {
    return null
  }
}

export function writeSession(session: Session) {
  localStorage.setItem(KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(KEY)
}
