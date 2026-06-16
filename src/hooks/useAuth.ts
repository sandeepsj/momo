import { useCallback, useEffect, useState } from 'react'
import type { AuthState } from '@/types'
import { clearSession, loadSession, signIn, signOut } from '@/services/googleAuth'

export interface UseAuth {
  auth: AuthState | null
  loading: boolean
  error: string | null
  login: () => Promise<void>
  logout: () => void
  /** Called by the data layer on a 401 — drop the session and bounce to login. */
  expire: () => void
}

export function useAuth(): UseAuth {
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Restore synchronously on mount — no popup, no network round-trip.
  useEffect(() => {
    const restored = loadSession()
    if (restored) setAuth(restored)
  }, [])

  const login = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setAuth(await signIn())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    if (auth) signOut(auth.accessToken)
    else clearSession()
    setAuth(null)
  }, [auth])

  const expire = useCallback(() => {
    clearSession()
    setAuth(null)
    setError('Your session expired — please sign in again.')
  }, [])

  return { auth, loading, error, login, logout, expire }
}
