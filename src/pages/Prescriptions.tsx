import { useRef, useState, type CSSProperties } from 'react'
import { usePets } from '@/context/PetProvider'
import { useMediaUrl } from '@/hooks/useMediaUrl'
import { Icon } from '@/components/icons'
import { uploadMedia, mediaDataUrl, deleteMedia } from '@/services/drive'
import { transcribePrescription } from '@/lib/llm-proxy'
import { toDateInput, fromDateInput, uid } from '@/lib/format'
import type { Pet, Prescription } from '@/types'

const INDIGO = '#7A6CF0'

function RxCard({ rx, mutate, token }: { rx: Prescription; mutate: (fn: (p: Pet) => Pet) => void; token: string }) {
  const url = useMediaUrl(rx.imageFileId)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const transcribed = !!rx.transcript.trim()

  const patch = (patch: Partial<Prescription>) => mutate((p) => ({ ...p, medical: { ...p.medical, prescriptions: p.medical.prescriptions.map((x) => (x.id === rx.id ? { ...x, ...patch } : x)) } }))

  const transcribe = async () => {
    if (!rx.imageFileId) {
      setErr('Upload a scan image first.')
      return
    }
    setBusy(true)
    setErr(null)
    try {
      const dataUrl = await mediaDataUrl(rx.imageFileId, token)
      patch({ transcript: await transcribePrescription(dataUrl, token) })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Transcription failed')
    } finally {
      setBusy(false)
    }
  }
  const remove = async () => {
    if (rx.imageFileId) await deleteMedia(rx.imageFileId, token).catch(() => {})
    mutate((p) => ({ ...p, medical: { ...p.medical, prescriptions: p.medical.prescriptions.filter((x) => x.id !== rx.id) } }))
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--card)', border: '1.5px solid var(--line)', borderLeft: `5px solid ${INDIGO}`, borderRadius: 24, boxShadow: 'var(--shadow-sm)', animation: 'rise .5s both' }}>
      <div style={{ position: 'absolute', right: -8, top: -30, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 170, color: 'color-mix(in srgb,#7A6CF0 7%,transparent)', lineHeight: 1, pointerEvents: 'none' }}>℞</div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 20px', background: 'color-mix(in srgb,#7A6CF0 8%,var(--card))', borderBottom: '1.5px dashed color-mix(in srgb,#7A6CF0 26%,var(--line))' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 21, color: INDIGO, lineHeight: 1 }}>℞</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 800, letterSpacing: '.13em', color: INDIGO }}>PRESCRIPTION</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 800, letterSpacing: '.03em', textTransform: 'uppercase', padding: '4px 11px', borderRadius: 999, background: transcribed ? 'color-mix(in srgb,#5FA777 16%,transparent)' : 'color-mix(in srgb,#E0A458 20%,transparent)', color: transcribed ? '#4f8c62' : '#C28A3A' }}>{transcribed ? 'Transcribed' : 'Awaiting AI'}</span>
      </div>
      <div style={{ position: 'relative', padding: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ position: 'relative', flexShrink: 0, transform: 'rotate(-3deg)', marginTop: 4 }}>
            <span style={{ position: 'absolute', top: -13, left: 14, color: '#9a93c9', transform: 'rotate(18deg)', zIndex: 2 }}><Icon name="clip" size={26} sw={1.6} /></span>
            <div style={{ width: 106, background: '#fff', padding: '7px 7px 20px', borderRadius: 4, boxShadow: '0 12px 24px -10px rgba(50,38,90,.45)' }}>
              {url ? (
                <img src={url} alt="" style={{ width: 92, height: 86, objectFit: 'cover', borderRadius: 3, display: 'block' }} />
              ) : (
                <div style={{ width: 92, height: 86, borderRadius: 3, background: 'repeating-linear-gradient(color-mix(in srgb,#7A6CF0 5%,#fff),color-mix(in srgb,#7A6CF0 5%,#fff) 12px,color-mix(in srgb,#7A6CF0 16%,#fff) 12px,color-mix(in srgb,#7A6CF0 16%,#fff) 14px)', display: 'grid', placeItems: 'center', color: '#9a93c9' }}><Icon name="doc" size={34} sw={1.5} /></div>
              )}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 600, letterSpacing: '.1em', textAlign: 'center', color: '#8a83b5', marginTop: 5 }}>SCAN</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 10 }}>
              <div><label className="lbl">Title</label><input className="input" value={rx.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Prescription" /></div>
              <div><label className="lbl">Date</label><input className="input" type="date" value={toDateInput(rx.date)} onChange={(e) => patch({ date: fromDateInput(e.target.value) })} /></div>
            </div>
            <div style={{ marginTop: 10 }}><label className="lbl">Prescribed by</label><input className="input" value={rx.doctor} onChange={(e) => patch({ doctor: e.target.value })} /></div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '18px 0 9px' }}>
          <span className="lbl" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: INDIGO }}><Icon name="spark" size={16} /></span> AI transcript</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn sm" onClick={transcribe} disabled={busy} style={{ background: 'linear-gradient(135deg,#7A6CF0,#A78BFA)', color: '#fff', borderColor: 'transparent', boxShadow: '0 8px 18px -8px #7A6CF0' }}>
              {busy ? <><span className="spin" /> Reading…</> : <><Icon name={transcribed ? 'refresh' : 'spark'} size={15} /> {transcribed ? 'Re-transcribe' : 'Transcribe with AI'}</>}
            </button>
            <button className="btn ghost sm danger" onClick={remove}>Delete</button>
          </div>
        </div>

        {err && <p style={{ color: 'var(--danger)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 700, margin: '0 0 8px' }}>{err}</p>}

        {busy ? (
          <div style={{ height: 104, borderRadius: 14, background: 'linear-gradient(100deg,color-mix(in srgb,#7A6CF0 8%,var(--card)) 30%,color-mix(in srgb,#7A6CF0 22%,var(--card)) 50%,color-mix(in srgb,#7A6CF0 8%,var(--card)) 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.3s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'var(--font-display)', fontWeight: 500, color: INDIGO }}>
            <Icon name="spark" size={16} /> Reading the scan…
          </div>
        ) : (
          <>
            <textarea className="input" rows={6} value={rx.transcript} onChange={(e) => patch({ transcript: e.target.value })} placeholder="Tap Transcribe with AI — or type the details here." style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, lineHeight: '25px', paddingTop: 8, background: 'repeating-linear-gradient(var(--card),var(--card) 24px,color-mix(in srgb,#7A6CF0 12%,transparent) 25px)', borderColor: 'color-mix(in srgb,#7A6CF0 26%,var(--line))' }} />
            <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--ink-faint)', margin: '8px 0 0' }}><Icon name="warn" size={13} /> AI transcripts can contain mistakes — verify dosages against the original.</p>
          </>
        )}
      </div>
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
      const rx: Prescription = { id: uid(), date: new Date().toISOString(), title: '', doctor: pet.vets[0]?.name ?? '', imageFileId: fileId, transcript: '', notes: '' }
      mutate((p) => ({ ...p, medical: { ...p.medical, prescriptions: [...p.medical.prescriptions, rx] } }))
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, marginBottom: 22, animation: 'rise .5s both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <span className="stkr" style={{ background: 'linear-gradient(145deg,#7A6CF0,#A78BFA)', boxShadow: '0 7px 14px -6px #7A6CF0,inset 0 1px 0 rgba(255,255,255,.4)' }}><Icon name="pill" size={20} /></span>
          <div>
            <h1 className="h1" style={{ lineHeight: 1 }}>Prescriptions</h1>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: 14.5 }}>Snap a scan — AI turns it into <span className="hl" style={{ ['--hlc' as string]: 'color-mix(in srgb,#7A6CF0 22%,transparent)' } as CSSProperties}>clean, searchable text.</span></p>
          </div>
        </div>
        <button className="btn" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background: 'linear-gradient(135deg,#7A6CF0,#A78BFA)', color: '#fff', borderColor: 'transparent', boxShadow: '0 8px 18px -8px #7A6CF0' }}>
          {uploading ? <span className="spin" /> : <Icon name="cam" size={17} />} Upload scan
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </div>

      {list.length === 0 ? (
        <div style={{ position: 'relative', overflow: 'hidden', background: 'color-mix(in srgb,#7A6CF0 5%,var(--card))', border: '2px dashed color-mix(in srgb,#7A6CF0 32%,var(--line-strong))', borderRadius: 26, padding: 54, textAlign: 'center', animation: 'pop .4s both' }}>
          <div style={{ position: 'absolute', right: -10, top: -26, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 170, color: 'color-mix(in srgb,#7A6CF0 7%,transparent)', lineHeight: 1 }}>℞</div>
          <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 20, margin: '0 auto 14px', display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(145deg,#7A6CF0,#A78BFA)', transform: 'rotate(-7deg)', boxShadow: '0 12px 24px -8px #7A6CF0' }}><Icon name="pill" size={28} /></div>
          <p style={{ position: 'relative', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 19, margin: 0, color: 'var(--ink)' }}>No prescriptions yet</p>
          <p style={{ position: 'relative', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--ink-soft)', margin: '6px 0 0' }}>Tap <b style={{ color: INDIGO }}>Upload scan</b> and let AI do the typing.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {list.map((rx) => <RxCard key={rx.id} rx={rx} mutate={mutate} token={token} />)}
        </div>
      )}
    </>
  )
}
