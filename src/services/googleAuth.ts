// Google Identity Services (GIS) token-client auth.
//
// Token lives in JS memory only, so a refresh wipes it. We persist defensively:
//   - user info  → localStorage   (survives tab close; used for the avatar/UI)
//   - access token → sessionStorage (matches the token's ~1hr lifetime)
// On mount we restore synchronously (no popup, no network). On a 401 we clear
// and re-auth. See the react-spa-google-stack skill for the full rationale.

import type { AuthState, GoogleUser } from '@/types'

// drive.file: app only sees files it created (privacy-friendly). They still
// appear in the user's Drive UI. openid/email/profile for the avatar.
const SCOPES = 'https://www.googleapis.com/auth/drive.file openid email profile'
const USER_KEY = 'momo_user'
const TOKEN_KEY = 'momo_token'

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string
            scope: string
            callback: (resp: { access_token: string; error?: string }) => void
            error_callback?: (err: { message: string }) => void
          }): { requestAccessToken: (opts?: { prompt?: string }) => void }
          revoke(token: string, done?: () => void): void
        }
      }
    }
  }
}

function getClientId(): string {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!id) throw new Error('VITE_GOOGLE_CLIENT_ID is not set')
  return id
}

function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve()
    let tries = 0
    const timer = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(timer)
        resolve()
      } else if (++tries > 100) {
        clearInterval(timer)
        reject(new Error('Google Identity Services failed to load'))
      }
    }, 50)
  })
}

export function saveSession(user: GoogleUser, token: string): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function loadSession(): AuthState | null {
  const token = sessionStorage.getItem(TOKEN_KEY)
  const raw = localStorage.getItem(USER_KEY)
  if (!token || !raw) return null
  try {
    return { isLoggedIn: true, user: JSON.parse(raw) as GoogleUser, accessToken: token }
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

async function fetchUserInfo(token: string): Promise<GoogleUser> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`userinfo ${res.status}`)
  const data = (await res.json()) as { email: string; name: string; picture: string }
  return { email: data.email, name: data.name, picture: data.picture }
}

/** Must be called from a user gesture (click) — browsers block the popup otherwise. */
export async function signIn(): Promise<AuthState> {
  await loadGisScript()
  return new Promise((resolve, reject) => {
    const tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: getClientId(),
      scope: SCOPES,
      callback: async (response) => {
        if (response.error) return reject(new Error(response.error))
        try {
          const user = await fetchUserInfo(response.access_token)
          saveSession(user, response.access_token)
          resolve({ isLoggedIn: true, user, accessToken: response.access_token })
        } catch (e) {
          reject(e as Error)
        }
      },
      error_callback: (err) => reject(new Error(err.message)),
    })
    tokenClient.requestAccessToken()
  })
}

export function signOut(token: string): void {
  try {
    window.google?.accounts.oauth2.revoke(token)
  } finally {
    clearSession()
  }
}
