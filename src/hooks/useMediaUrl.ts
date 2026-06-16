// Loads a Drive media file as an object URL on demand and revokes it on unmount.
import { useEffect, useState } from 'react'
import { mediaObjectUrl } from '@/services/drive'
import { usePets } from '@/context/PetProvider'

export function useMediaUrl(fileId: string | undefined): string | undefined {
  const { token } = usePets()
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    if (!fileId) {
      setUrl(undefined)
      return
    }
    let revoked = false
    let made: string | undefined
    mediaObjectUrl(fileId, token)
      .then((u) => {
        if (revoked) {
          URL.revokeObjectURL(u)
        } else {
          made = u
          setUrl(u)
        }
      })
      .catch(() => setUrl(undefined))
    return () => {
      revoked = true
      if (made) URL.revokeObjectURL(made)
    }
  }, [fileId, token])

  return url
}
