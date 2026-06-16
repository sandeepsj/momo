import { useRef, useState } from 'react'
import { usePets } from '@/context/PetProvider'
import { useMediaUrl } from '@/hooks/useMediaUrl'
import { uploadMedia, deleteMedia } from '@/services/drive'
import { uid } from '@/lib/format'
import type { GalleryPhoto, Pet } from '@/types'

function Tile({ photo, mutate, token }: { photo: GalleryPhoto; mutate: (fn: (p: Pet) => Pet) => void; token: string }) {
  const url = useMediaUrl(photo.fileId)
  const remove = async () => {
    await deleteMedia(photo.fileId, token).catch(() => {})
    mutate((p) => ({ ...p, gallery: p.gallery.filter((g) => g.id !== photo.id) }))
  }
  const setCaption = (caption: string) =>
    mutate((p) => ({ ...p, gallery: p.gallery.map((g) => (g.id === photo.id ? { ...g, caption } : g)) }))

  return (
    <div className="photo">
      {url ? <img src={url} alt={photo.caption} /> : <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}><span className="spin" /></div>}
      <button className="del" onClick={remove} title="Delete">✕</button>
      <input
        className="cap"
        value={photo.caption}
        placeholder="Add a caption…"
        onChange={(e) => setCaption(e.target.value)}
        style={{ border: 'none', background: 'transparent', color: '#fff', outline: 'none' }}
      />
    </div>
  )
}

export default function Gallery() {
  const { current, mutate, token } = usePets()
  const pet = current!.pet
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const onFiles = async (files: FileList) => {
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const fileId = await uploadMedia(pet.id, file, `photo-${Date.now()}-${file.name}`, token)
        const photo: GalleryPhoto = { id: uid(), fileId, caption: '', date: new Date().toISOString() }
        mutate((p) => ({ ...p, gallery: [...p.gallery, photo] }))
      }
    } finally {
      setUploading(false)
    }
  }

  const photos = [...pet.gallery].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>🖼️ Gallery</h1>
          <p className="sub">All of {pet.name}'s cutest moments.</p>
        </div>
        <div className="spacer" />
        <button className="btn primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <span className="spin" /> : '📷 Add photos'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && onFiles(e.target.files)} />
      </div>

      {photos.length === 0 ? (
        <div className="card empty">
          <div className="big">📸</div>
          <p>No photos yet. Add a few favourites!</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {photos.map((ph) => <Tile key={ph.id} photo={ph} mutate={mutate} token={token} />)}
        </div>
      )}
    </div>
  )
}
