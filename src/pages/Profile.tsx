import { useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { usePets } from '@/context/PetProvider'
import { StickerHeader, TagField } from '@/components/ui'
import { Avatar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { uploadMedia } from '@/services/drive'
import { toDateInput, fromDateInput, uid } from '@/lib/format'
import type { VetInfo } from '@/types'

const SWATCHES = ['#F7A072', '#E58FB1', '#F2C14E', '#8EC5FC', '#9FD9B8', '#C3B1E1', '#7FB7C9', '#E0A458']

function setPath(obj: Record<string, unknown>, path: string, val: unknown) {
  const ks = path.split('.')
  const last = ks.pop() as string
  let t = obj
  for (const k of ks) t = t[k] as Record<string, unknown>
  t[last] = val
}

export default function Profile() {
  const { current, mutate, token } = usePets()
  const pet = current!.pet
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  // Delegated autosave for the uncontrolled identity/story/diet fields.
  const onInput = (e: FormEvent) => {
    const t = e.target as HTMLInputElement
    if (t.dataset.add) return
    const f = t.dataset.field
    if (!f) return
    const v = t.dataset.type === 'date' ? fromDateInput(t.value) : t.value
    mutate((p) => {
      const n = structuredClone(p)
      setPath(n as unknown as Record<string, unknown>, f, v)
      return n
    })
  }

  const onAvatar = async (file: File) => {
    setUploading(true)
    try {
      const fileId = await uploadMedia(pet.id, file, `avatar-${Date.now()}-${file.name}`, token)
      mutate((p) => ({ ...p, avatarFileId: fileId }))
    } finally {
      setUploading(false)
    }
  }

  // vets
  const addVet = () => mutate((p) => ({ ...p, vets: [...p.vets, { id: uid(), name: '', clinic: '', phone: '', address: '' }] }))
  const updateVet = (id: string, field: keyof VetInfo, value: string) => mutate((p) => ({ ...p, vets: p.vets.map((v) => (v.id === id ? { ...v, [field]: value } : v)) }))
  const removeVet = (id: string) => mutate((p) => ({ ...p, vets: p.vets.filter((v) => v.id !== id) }))

  // food tags
  const setFood = (key: 'likes' | 'allergies' | 'brands' | 'dislikes', v: string[]) => mutate((p) => ({ ...p, food: { ...p.food, [key]: v } }))

  // tricks
  const addTrick = () => mutate((p) => ({ ...p, tricks: [...p.tricks, { id: uid(), situation: '', method: '' }] }))
  const updateTrick = (id: string, field: 'situation' | 'method', value: string) => mutate((p) => ({ ...p, tricks: p.tricks.map((t) => (t.id === id ? { ...t, [field]: value } : t)) }))
  const removeTrick = (id: string) => mutate((p) => ({ ...p, tricks: p.tricks.filter((t) => t.id !== id) }))

  const setAccent = (c: string) => mutate((p) => ({ ...p, accent: c }))

  const tealBtn: CSSProperties = { color: '#3690a0', borderColor: 'color-mix(in srgb,#4BB3C4 40%,var(--line-strong))' }

  return (
    <div key={pet.id} onInput={onInput}>
      <div style={{ marginBottom: 18, animation: 'rise .5s both' }}>
        <h1 className="h1">{pet.name}'s <span className="hl">profile</span></h1>
        <p className="muted" style={{ margin: '4px 0 0' }}>Everything that makes them one of a kind.</p>
      </div>

      {/* IDENTITY — passport */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: '30px 30px 30px 12px', boxShadow: 'var(--shadow-sm)', marginBottom: 18, animation: 'rise .5s .05s both' }}>
        <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 52%,var(--accent-2)))', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 15 }}>
          <Avatar fileId={pet.avatarFileId} emoji={pet.emoji} fontSize={36} style={{ width: 62, height: 62, borderRadius: 20, background: 'rgba(255,255,255,.96)', transform: 'rotate(-5deg)', boxShadow: '0 9px 18px -6px rgba(0,0,0,.32)', flexShrink: 0 }} />
          <div style={{ color: '#fff', position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 800, letterSpacing: '.14em', opacity: 0.85 }}>PET PASSPORT</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 25, lineHeight: 1.15 }}>{pet.name}</div>
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn sm" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ position: 'relative', background: 'rgba(255,255,255,.92)', borderColor: 'transparent', color: 'var(--accent-ink)' }}>
            {uploading ? <span className="spin dark" /> : <Icon name="cam" size={17} />} Photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onAvatar(e.target.files[0])} />
        </div>
        <div style={{ padding: '22px 24px' }}>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label className="lbl">Name</label><input className="input" data-field="name" defaultValue={pet.name} /></div>
            <div><label className="lbl">Breed</label><input className="input" data-field="breed" defaultValue={pet.breed} placeholder="e.g. Indian shorthair" /></div>
            <div><label className="lbl">Birthday</label><input className="input" type="date" data-field="birthday" data-type="date" defaultValue={toDateInput(pet.birthday)} /></div>
            <div><label className="lbl">Gotcha day</label><input className="input" type="date" data-field="adoptionDate" data-type="date" defaultValue={toDateInput(pet.adoptionDate)} /></div>
            <div><label className="lbl">Gender</label><select className="input" data-field="gender" defaultValue={pet.gender}><option value="unknown">Unknown</option><option value="male">Male</option><option value="female">Female</option></select></div>
            <div><label className="lbl">Emoji</label><input className="input" data-field="emoji" defaultValue={pet.emoji} maxLength={4} /></div>
          </div>
          <div style={{ marginTop: 18 }}>
            <label className="lbl">Theme colour</label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {SWATCHES.map((c) => {
                const sel = pet.accent.toLowerCase() === c.toLowerCase()
                return <button key={c} onClick={() => setAccent(c)} title="Set theme colour" style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', background: c, boxShadow: sel ? `0 0 0 3px var(--card),0 0 0 5px ${c}` : 'var(--shadow-sm)', transition: 'transform .15s' }} onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.14)')} onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')} />
              })}
            </div>
          </div>
        </div>
      </div>

      {/* STORY — amber journal */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'color-mix(in srgb,#E0A458 7%,var(--card))', border: '1.5px solid color-mix(in srgb,#E0A458 24%,var(--line))', borderRadius: 26, padding: 24, boxShadow: 'var(--shadow-sm)', marginBottom: 18, animation: 'rise .5s .1s both' }}>
        <div style={{ position: 'absolute', top: -9, left: 44, width: 104, height: 22, background: 'rgba(224,164,88,.42)', transform: 'rotate(-4deg)', borderRadius: 2 }} />
        <StickerHeader icon="book" color="#E0A458" title="Our story" mb={14} />
        <textarea className="input" data-field="story" rows={5} placeholder="The day we met…" defaultValue={pet.story} style={{ fontStyle: 'italic', fontWeight: 500, lineHeight: '31px', paddingTop: 7, background: 'repeating-linear-gradient(var(--card),var(--card) 30px,color-mix(in srgb,#E0A458 26%,transparent) 31px)', borderColor: 'color-mix(in srgb,#E0A458 30%,var(--line))' }} />
      </div>

      {/* VETS — teal */}
      <div style={{ background: 'color-mix(in srgb,#4BB3C4 6%,var(--card))', border: '1.5px solid color-mix(in srgb,#4BB3C4 22%,var(--line))', borderRadius: 26, padding: 24, boxShadow: 'var(--shadow-sm)', marginBottom: 18, animation: 'rise .5s .15s both' }}>
        <StickerHeader icon="cross" color="#4BB3C4" title="Vets & clinics" mb={6} action={<button className="btn sm" onClick={addVet} style={tealBtn}>＋ Add vet</button>} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-faint)', margin: '0 0 14px' }}>Your regular vet, plus emergency &amp; specialist contacts.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pet.vets.length === 0 && <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-faint)', fontWeight: 600, margin: 0 }}>No vets yet — add your regular clinic.</p>}
          {pet.vets.map((v, i) => {
            const initial = (v.name.replace(/^dr\.?\s*/i, '').match(/[A-Za-z0-9]/)?.[0] ?? 'V').toUpperCase()
            return (
              <div key={v.id} style={{ position: 'relative', background: 'var(--card)', border: '1.5px solid var(--line)', borderLeft: '4px solid #4BB3C4', borderRadius: 18, padding: '16px 16px 16px 18px' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 15, flexShrink: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 21, color: '#3690a0', background: 'color-mix(in srgb,#4BB3C4 18%,transparent)', transform: 'rotate(-4deg)' }}>{initial}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div><label className="lbl">Doctor</label><input className="input" value={v.name} onChange={(e) => updateVet(v.id, 'name', e.target.value)} placeholder="Dr. …" /></div>
                      <div><label className="lbl">Clinic</label><input className="input" value={v.clinic} onChange={(e) => updateVet(v.id, 'clinic', e.target.value)} /></div>
                      <div><label className="lbl" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: '#4BB3C4' }}><Icon name="phone" size={13} /></span> Phone</label><input className="input" value={v.phone} onChange={(e) => updateVet(v.id, 'phone', e.target.value)} /></div>
                      <div><label className="lbl" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: '#4BB3C4' }}><Icon name="pin" size={13} /></span> Address / note</label><input className="input" value={v.address} onChange={(e) => updateVet(v.id, 'address', e.target.value)} /></div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 11 }}>
                  {i === 0 && <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', color: '#3690a0', background: 'color-mix(in srgb,#4BB3C4 16%,transparent)', padding: '4px 10px', borderRadius: 999 }}>★ Primary vet</span>}
                  <div style={{ flex: 1 }} />
                  <button className="btn ghost sm danger" onClick={() => removeVet(v.id)}>Remove</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FOOD — green */}
      <div style={{ background: 'color-mix(in srgb,#5FA777 6%,var(--card))', border: '1.5px solid color-mix(in srgb,#5FA777 22%,var(--line))', borderRadius: 26, padding: 24, boxShadow: 'var(--shadow-sm)', marginBottom: 18, animation: 'rise .5s .2s both' }}>
        <StickerHeader icon="food" color="#5FA777" title="Food & diet" />
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div>
            <label className="lbl" style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#4f8c62' }}><span style={{ color: '#5FA777' }}><Icon name="leaf" size={14} /></span> Loves</label>
            <TagField values={pet.food.likes} onChange={(v) => setFood('likes', v)} chipStyle={{ background: 'color-mix(in srgb,#5FA777 16%,transparent)', color: '#4f8c62' }} />
          </div>
          <div>
            <label className="lbl" style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--danger)' }}><span style={{ color: 'var(--danger)' }}><Icon name="warn" size={13} /></span> Allergies</label>
            <TagField values={pet.food.allergies} onChange={(v) => setFood('allergies', v)} chipStyle={{ background: 'color-mix(in srgb,var(--danger) 15%,transparent)', color: 'var(--danger)' }} />
          </div>
          <div>
            <label className="lbl">Brands</label>
            <TagField values={pet.food.brands} onChange={(v) => setFood('brands', v)} chipStyle={{ background: 'var(--sunken)', color: 'var(--ink-soft)' }} />
          </div>
          <div>
            <label className="lbl">Won't touch</label>
            <TagField values={pet.food.dislikes} onChange={(v) => setFood('dislikes', v)} chipStyle={{ background: 'var(--sunken)', color: 'var(--ink-soft)' }} />
          </div>
        </div>
        <div style={{ marginTop: 16 }}><label className="lbl">Feeding schedule &amp; notes</label><textarea className="input" data-field="food.diet" rows={2} defaultValue={pet.food.diet} style={{ fontWeight: 500, lineHeight: 1.6 }} /></div>
      </div>

      {/* TRICKS — violet sticky notes */}
      <div style={{ background: 'color-mix(in srgb,#C58CFF 7%,var(--card))', border: '1.5px solid color-mix(in srgb,#C58CFF 24%,var(--line))', borderRadius: 26, padding: 24, boxShadow: 'var(--shadow-sm)', animation: 'rise .5s .25s both' }}>
        <StickerHeader icon="bulb" color="#C58CFF" title="Handling tricks" mb={6} action={<button className="btn sm" onClick={addTrick} style={{ color: '#8b54c9', borderColor: 'color-mix(in srgb,#C58CFF 40%,var(--line-strong))' }}>＋ Add</button>} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-faint)', margin: '0 0 16px' }}>Little hacks for daily life with {pet.name}.</p>
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {pet.tricks.map((t, i) => (
            <div key={t.id} style={{ position: 'relative', background: '#FBEEAC', borderRadius: '6px 6px 14px 14px', padding: '18px 15px 15px', transform: `rotate(${i % 2 ? 1.1 : -1.1}deg)`, boxShadow: '0 10px 22px -10px rgba(120,90,30,.5)' }}>
              <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%) rotate(-3deg)', width: 62, height: 18, background: 'rgba(255,255,255,.55)', border: '1px solid rgba(150,120,40,.2)' }} />
              <input value={t.situation} onChange={(e) => updateTrick(t.id, 'situation', e.target.value)} placeholder="When… (e.g. get them off the wardrobe)" style={{ width: '100%', border: 'none', background: 'transparent', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: '#4a3f1c', marginBottom: 6, outline: 'none' }} />
              <textarea value={t.method} onChange={(e) => updateTrick(t.id, 'method', e.target.value)} placeholder="…do this" rows={2} style={{ width: '100%', border: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: '#6b5d33', lineHeight: 1.5, resize: 'none', outline: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}><button onClick={() => removeTrick(t.id)} style={{ border: 'none', background: 'transparent', color: '#9a7c2e', fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>remove ✕</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
