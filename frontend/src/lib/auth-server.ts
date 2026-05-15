import { cookies } from 'next/headers'
import type { User } from '@/types'

// ── Client-side helpers ───────────────────────
export function saveAuth(token: string, user: User) {
  localStorage.setItem('sf_token', token)
  localStorage.setItem('sf_user', JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem('sf_token')
  localStorage.removeItem('sf_user')
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('sf_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ── Server-side helpers ───────────────────────
// We store token in cookie for server-side access (middleware/redirects).
// The primary auth store is still localStorage for API calls.
export function getServerToken(): string | null {
  try {
    const cookieStore = cookies()
    return cookieStore.get('sf_token')?.value ?? null
  } catch {
    return null
  }
}
