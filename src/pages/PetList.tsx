import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePets } from '@/context/PetProvider'
import { useTheme } from '@/context/ThemeProvider'
import Backdrop from '@/components/Backdrop'
import { Modal, ModalActions } from '@/components/ui'
import { Icon, ThemeGlyph } from '@/components/icons'
import { SPECIES_PRESETS } from '@/data/petKinds'
import { fmtDateShort } from '@/lib/format'
import type { Species } from '@/types'

export default function PetList() {
  const { pets, select, createPet, auth } = usePets()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const [species, setSpecies] = useState<Species>('cat')

  const first = auth.user.name?.split(' ')[0] ?? 'friend'

  const open = async (fileId: string) => {
    await select(fileId)
    navigate('/dashboard')
  }
  const submit = async () => {
    if (!name.trim()) return
    setBusy(true)
    await createPet(name, species)
    setBusy(false)
    setAdding(false)
    setName('')
    navigate('/dashboard')
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      <Backdrop />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 880, margin: '0 auto', padding: '46px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30, animation: 'rise .5s both' }}>
          <div>
            <p className="lbl" style={{ marginBottom: 4 }}>Welcome back, {first}</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 38, letterSpacing: '-.02em', margin: 0 }}>Your <span className="hl">companions</span></h1>
          </div>
          <div style={{ flex: 1 }} />
          <button className="iconbtn" onClick={toggle} title="Toggle theme"><ThemeGlyph dark={theme === 'dark'} /></button>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', color: 'var(--accent-ink)', overflow: 'hidden' }}>
            {auth.user.picture ? <img src={auth.user.picture} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="user" size={19} />}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 18 }}>
          {pets.map((p) => (
            <button key={p.fileId} className="petcard" onClick={() => open(p.fileId)} style={{ position: 'relative', textAlign: 'left', cursor: 'pointer', background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: '28px 28px 28px 12px', padding: 24, boxShadow: 'var(--shadow-sm)', transition: 'all .25s cubic-bezier(.2,.8,.2,1)', overflow: 'hidden', animation: 'rise .5s both' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: p.accent }} />
              <div style={{ width: 76, height: 76, borderRadius: 24, display: 'grid', placeItems: 'center', fontSize: 42, background: `color-mix(in srgb, ${p.accent} 22%, transparent)`, marginBottom: 14, transform: 'rotate(-4deg)', boxShadow: 'var(--sticker)' }}>{p.emoji}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 23, margin: '0 0 2px' }}>{p.name}</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--ink-soft)', margin: 0, fontSize: 14, textTransform: 'capitalize' }}>{p.species}</p>
              <div style={{ marginTop: 14 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: 'var(--sunken)', color: 'var(--ink-soft)' }}>updated {fmtDateShort(p.updatedAt)}</span>
              </div>
              <div className="openrow" style={{ opacity: 0, transition: 'opacity .2s', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13.5, color: 'var(--accent-ink)', marginTop: 12 }}>Open profile →</div>
            </button>
          ))}
          <button className="petcard" onClick={() => setAdding(true)} style={{ cursor: 'pointer', background: 'transparent', border: '2.5px dashed var(--line-strong)', borderRadius: 28, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 210, color: 'var(--ink-soft)', transition: 'all .25s', animation: 'rise .5s both' }}>
            <div style={{ width: 58, height: 58, borderRadius: 18, background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', color: 'var(--accent-ink)', transform: 'rotate(-6deg)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" style={{ width: 24, height: 24 }}><path d="M12 5v14M5 12h14" /></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16 }}>Add a pet</span>
          </button>
        </div>
      </div>

      {adding && (
        <Modal title="Add a pet" onClose={() => setAdding(false)}>
          <label className="lbl">Name</label>
          <input className="input" autoFocus value={name} placeholder="e.g. momo" onChange={(e) => setName(e.target.value)} style={{ marginBottom: 16 }} />
          <label className="lbl">Species</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SPECIES_PRESETS.map((s) => {
              const on = species === s.species
              const style: CSSProperties = { borderColor: on ? 'var(--accent)' : 'var(--line-strong)', background: on ? 'var(--accent-soft)' : 'var(--card)', color: on ? 'var(--accent-ink)' : 'var(--ink)' }
              return <button key={s.species} className="btn sm" onClick={() => setSpecies(s.species)} style={style}>{s.emoji} {s.label}</button>
            })}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-faint)', margin: '16px 0 0', lineHeight: 1.5 }}>We'll seed a care schedule for your new {SPECIES_PRESETS.find((s) => s.species === species)?.label.toLowerCase()} automatically. 🐾</p>
          <ModalActions onCancel={() => setAdding(false)} onSave={submit} saveLabel={busy ? 'Creating…' : 'Create'} saveDisabled={busy || !name.trim()} />
        </Modal>
      )}
    </div>
  )
}
