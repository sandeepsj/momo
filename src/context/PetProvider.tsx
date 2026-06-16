// App-wide state: the signed-in session, the list of pets, the currently open
// pet, and an optimistic `mutate` that debounces a save to Drive. Pages call
// mutate() and never touch the Drive layer directly.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { AuthState, Pet, PetSummary, Species } from '@/types'
import {
  AuthExpiredError,
  createPet as storeCreate,
  listPets,
  openPet,
  persist,
  removePet,
} from '@/lib/store'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface PetContextValue {
  auth: AuthState
  token: string
  pets: PetSummary[]
  refreshPets: () => Promise<void>
  current: { fileId: string; pet: Pet } | null
  loadingPet: boolean
  select: (fileId: string) => Promise<void>
  clearCurrent: () => void
  createPet: (name: string, species: Species) => Promise<void>
  removeCurrent: () => Promise<void>
  mutate: (fn: (p: Pet) => Pet) => void
  saving: SaveState
  logout: () => void
}

const PetContext = createContext<PetContextValue | null>(null)

export function usePets(): PetContextValue {
  const ctx = useContext(PetContext)
  if (!ctx) throw new Error('usePets must be used within <PetProvider>')
  return ctx
}

export function PetProvider({
  auth,
  onExpire,
  onLogout,
  children,
}: {
  auth: AuthState
  onExpire: () => void
  onLogout: () => void
  children: ReactNode
}) {
  const token = auth.accessToken
  const [pets, setPets] = useState<PetSummary[]>([])
  const [current, setCurrent] = useState<{ fileId: string; pet: Pet } | null>(null)
  const [loadingPet, setLoadingPet] = useState(false)
  const [saving, setSaving] = useState<SaveState>('idle')

  const saveTimer = useRef<number | undefined>(undefined)
  const pendingFileId = useRef<string | null>(null)

  // Funnel Drive errors: a 401 means the token died — bounce to login.
  const guard = useCallback(
    async <T,>(p: Promise<T>): Promise<T | undefined> => {
      try {
        return await p
      } catch (e) {
        if (e instanceof AuthExpiredError) onExpire()
        else console.error(e)
        return undefined
      }
    },
    [onExpire],
  )

  const refreshPets = useCallback(async () => {
    const list = await guard(listPets(token))
    if (list) setPets(list)
  }, [guard, token])

  useEffect(() => {
    void refreshPets()
  }, [refreshPets])

  const select = useCallback(
    async (fileId: string) => {
      setLoadingPet(true)
      const opened = await guard(openPet(fileId, token))
      if (opened) setCurrent(opened)
      setLoadingPet(false)
    },
    [guard, token],
  )

  const clearCurrent = useCallback(() => setCurrent(null), [])

  const createPet = useCallback(
    async (name: string, species: Species) => {
      const made = await guard(storeCreate(name, species, token))
      if (made) {
        setCurrent(made)
        await refreshPets()
      }
    },
    [guard, token, refreshPets],
  )

  const removeCurrent = useCallback(async () => {
    if (!current) return
    await guard(removePet(current.fileId, token))
    setCurrent(null)
    await refreshPets()
  }, [current, guard, token, refreshPets])

  // Optimistic local update + debounced persist.
  const mutate = useCallback(
    (fn: (p: Pet) => Pet) => {
      setCurrent((cur) => {
        if (!cur) return cur
        const next = { ...cur, pet: fn(cur.pet) }
        pendingFileId.current = cur.fileId
        setSaving('saving')
        window.clearTimeout(saveTimer.current)
        saveTimer.current = window.setTimeout(async () => {
          const fileId = pendingFileId.current
          if (!fileId) return
          const saved = await guard(persist(fileId, next.pet, token))
          if (saved) {
            setSaving('saved')
            setCurrent((c) => (c && c.fileId === fileId ? { ...c, pet: saved } : c))
            void refreshPets()
            window.setTimeout(() => setSaving((s) => (s === 'saved' ? 'idle' : s)), 1600)
          } else {
            setSaving('error')
          }
        }, 700)
        return next
      })
    },
    [guard, token, refreshPets],
  )

  const value = useMemo<PetContextValue>(
    () => ({
      auth,
      token,
      pets,
      refreshPets,
      current,
      loadingPet,
      select,
      clearCurrent,
      createPet,
      removeCurrent,
      mutate,
      saving,
      logout: onLogout,
    }),
    [
      auth, token, pets, refreshPets, current, loadingPet, select, clearCurrent,
      createPet, removeCurrent, mutate, saving, onLogout,
    ],
  )

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>
}
