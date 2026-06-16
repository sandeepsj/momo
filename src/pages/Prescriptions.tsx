import { useRef, useState } from 'react'
import { usePets } from '@/context/PetProvider'
import { useMediaUrl } from '@/hooks/useMediaUrl'
import { uploadMedia, mediaDataUrl, deleteMedia } from '@/services/drive'
import { transcribePrescription } from '@/lib/llm-proxy'
import { toDateInput, fromDateInput, uid } from '@/lib/format'
import type { Pet, Prescription } from '@/types'

function Card({ rx, mutate, token }: { rx: Prescription; mutate: (fn: (p: Pet) => Pet) => void; token: string }) {
  const url = useMediaUrl(rx.imageFileId)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const patch = (p: Partial<Prescription>) =>
    mutate((pt) => ({ ...pt, medical: { ...pt.medical, prescriptions: pt.medical.prescriptions.map((x) => (x.id === rx.id ? { ...x, ...p } : x)) } }))

  const transcribe = async () => {
    if (!rx.imageFileId) return
    setBusy(true)
    setErr(null)
    try {
      const dataUrl = await mediaDataUrl(rx.imageFileId, token)
      const text = await transcribePrescription(dataUrl, token)
      patch({ transcript: text })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Transcription failed')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (rx.imageFileId) await deleteMedia(rx.imageFileId, token).catch(() => {})
    mutate((pt) => ({ ...pt, medical: { ...pt.medical, prescriptions: pt.medical.prescriptions.filter((x) => x.id !== rx.id) } }))
  }

  return (
    <div className="card pad">
      <div className="row" style={{ alignItems: 'flex-start', gap: '1rem' }}>
        {url ? (
          <a href={url} target="_blank" rel="noreferrer">
            <img src={url} alt="" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
          </a>
        ) : (
          <div style={{ width: 120, height: 120, display: 'grid', placeItems: 'center', background: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)' }}>📃</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="grid cols-2">
            <div className="field"><label>Title</label><input className="input" value={rx.title} placeholder="Prescription" onChange={(e) => patch({ title: e.target.value })} /></div>
            <div className="field"><label>Date</label><input className="input" type="date" value={toDateInput(rx.date)} onChange={(e) => patch({ date: fromDateInput(e.target.value) })} /></div>
          </div>
          <div className="field" style={{ marginTop: '0.4rem' }}><label>Doctor</label><input className="input" value={rx.doctor} onChange={(e) => patch({ doctor: e.target.value })} /></div>
        </div>
      </div>

      <div className="row" style={{ marginTop: '0.8rem', justifyContent: 'space-between' }}>
        <span className="section-title">Transcript</span>
        <span className="row">
          <button className="btn sm" onClick={transcribe} disabled={busy || !rx.imageFileId}>
            {busy ? <><span className="spin" /> Reading…</> : rx.transcript ? '↻ Re-transcribe' : '✨ Transcribe with AI'}
          </button>
          <button className="btn ghost sm danger" onClick={remove}>Delete</button>
        </span>
      </div>
      {err && <p className="due-over" style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>{err}</p>}
      <textarea
        className="input transcript"
        style={{ marginTop: '0.5rem' }}
        rows={6}
        placeholder="Upload a clear photo, then tap Transcribe — or type the details here."
        value={rx.transcript}
        onChange={(e) => patch({ transcript: e.target.value })}
      />
      <p className="faint" style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>AI transcripts can contain mistakes — verify dosages against the original.</p>
    </div>
  )
}

export default function Prescriptions() {
  const { current, mutate, token } = usePets()
  const pet = current!.pet
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const list = [...pet.medical.prescriptions].sort((a, b) => (a.date < b.date ? 1 : -1))

  const onFile = async (file: File) => {
    setUploading(true)
    try {
      const fileId = await uploadMedia(pet.id, file, `rx-${Date.now()}-${file.name}`, token)
      const rx: Prescription = { id: uid(), date: new Date().toISOString(), title: '', doctor: pet.doctor.name, imageFileId: fileId, transcript: '', notes: '' }
      mutate((p) => ({ ...p, medical: { ...p.medical, prescriptions: [...p.medical.prescriptions, rx] } }))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>📃 Prescriptions</h1>
          <p className="sub">Scan a prescription and let AI turn it into searchable text.</p>
        </div>
        <div className="spacer" />
        <button className="btn primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <span className="spin" /> : '📷 Upload scan'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </div>

      {list.length === 0 ? (
        <div className="card empty">
          <div className="big">📃</div>
          <p>No prescriptions yet. Upload a photo to get started.</p>
        </div>
      ) : (
        <div className="list">
          {list.map((rx) => <Card key={rx.id} rx={rx} mutate={mutate} token={token} />)}
        </div>
      )}
    </div>
  )
}
