import { useRef, useState } from 'react'
import { usePets } from '@/context/PetProvider'
import { TagEditor, Avatar } from '@/components/ui'
import { uploadMedia } from '@/services/drive'
import { toDateInput, fromDateInput, uid } from '@/lib/format'
import type { Pet, Trick } from '@/types'

export default function Profile() {
  const { current, mutate, token } = usePets()
  const pet = current!.pet
  const set = (fn: (p: Pet) => Pet) => mutate(fn)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const onAvatar = async (file: File) => {
    setUploading(true)
    try {
      const fileId = await uploadMedia(pet.id, file, `avatar-${Date.now()}-${file.name}`, token)
      set((p) => ({ ...p, avatarFileId: fileId }))
    } finally {
      setUploading(false)
    }
  }

  const addTrick = () =>
    set((p) => ({ ...p, tricks: [...p.tricks, { id: uid(), situation: '', method: '' }] }))
  const updateTrick = (id: string, patch: Partial<Trick>) =>
    set((p) => ({ ...p, tricks: p.tricks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
  const removeTrick = (id: string) =>
    set((p) => ({ ...p, tricks: p.tricks.filter((t) => t.id !== id) }))

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>🪪 Profile</h1>
          <p className="sub">Everything that makes {pet.name} unique.</p>
        </div>
      </div>

      {/* identity */}
      <div className="card pad">
        <div className="row" style={{ alignItems: 'center', gap: '1rem' }}>
          <Avatar className="pic" fileId={pet.avatarFileId} emoji={pet.emoji} />
          <div>
            <button className="btn sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <span className="spin" /> : '📷 Change photo'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => e.target.files?.[0] && onAvatar(e.target.files[0])}
            />
          </div>
        </div>

        <div className="grid cols-2" style={{ marginTop: '1rem' }}>
          <div className="field">
            <label>Name</label>
            <input className="input" value={pet.name} onChange={(e) => set((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="field">
            <label>Breed</label>
            <input className="input" value={pet.breed} placeholder="e.g. Indian domestic shorthair" onChange={(e) => set((p) => ({ ...p, breed: e.target.value }))} />
          </div>
          <div className="field">
            <label>Gender</label>
            <select className="input" value={pet.gender} onChange={(e) => set((p) => ({ ...p, gender: e.target.value as Pet['gender'] }))}>
              <option value="unknown">Unknown</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="field">
            <label>Emoji</label>
            <input className="input" value={pet.emoji} maxLength={4} onChange={(e) => set((p) => ({ ...p, emoji: e.target.value }))} />
          </div>
          <div className="field">
            <label>Birthday 🎂</label>
            <input className="input" type="date" value={toDateInput(pet.birthday)} onChange={(e) => set((p) => ({ ...p, birthday: fromDateInput(e.target.value) }))} />
          </div>
          <div className="field">
            <label>Adoption / gotcha day 🏡</label>
            <input className="input" type="date" value={toDateInput(pet.adoptionDate)} onChange={(e) => set((p) => ({ ...p, adoptionDate: fromDateInput(e.target.value) }))} />
          </div>
          <div className="field">
            <label>Theme colour</label>
            <input className="input" type="color" value={pet.accent} style={{ height: 42, padding: 4 }} onChange={(e) => set((p) => ({ ...p, accent: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* story */}
      <div className="card pad">
        <h3>📖 Our story</h3>
        <p className="faint" style={{ fontSize: '0.85rem', margin: '0.3rem 0 0.6rem' }}>How {pet.name} came into your life.</p>
        <textarea
          className="input"
          rows={6}
          placeholder="The day we met…"
          value={pet.story}
          onChange={(e) => set((p) => ({ ...p, story: e.target.value }))}
        />
      </div>

      {/* doctor */}
      <div className="card pad">
        <h3>🩺 Favourite vet</h3>
        <div className="grid cols-2" style={{ marginTop: '0.6rem' }}>
          <div className="field"><label>Doctor</label><input className="input" value={pet.doctor.name} onChange={(e) => set((p) => ({ ...p, doctor: { ...p.doctor, name: e.target.value } }))} /></div>
          <div className="field"><label>Clinic</label><input className="input" value={pet.doctor.clinic} onChange={(e) => set((p) => ({ ...p, doctor: { ...p.doctor, clinic: e.target.value } }))} /></div>
          <div className="field"><label>Phone</label><input className="input" value={pet.doctor.phone} onChange={(e) => set((p) => ({ ...p, doctor: { ...p.doctor, phone: e.target.value } }))} /></div>
          <div className="field"><label>Address</label><input className="input" value={pet.doctor.address} onChange={(e) => set((p) => ({ ...p, doctor: { ...p.doctor, address: e.target.value } }))} /></div>
        </div>
        <div className="field" style={{ marginTop: '0.6rem' }}><label>Notes</label><textarea className="input" rows={2} value={pet.doctor.notes} onChange={(e) => set((p) => ({ ...p, doctor: { ...p.doctor, notes: e.target.value } }))} /></div>
      </div>

      {/* food */}
      <div className="card pad">
        <h3>🍽️ Food & diet</h3>
        <div className="grid cols-2" style={{ marginTop: '0.6rem' }}>
          <TagEditor label="Brands" values={pet.food.brands} onChange={(v) => set((p) => ({ ...p, food: { ...p.food, brands: v } }))} />
          <TagEditor label="Loves 😻" values={pet.food.likes} onChange={(v) => set((p) => ({ ...p, food: { ...p.food, likes: v } }))} />
          <TagEditor label="Dislikes 🙅" values={pet.food.dislikes} onChange={(v) => set((p) => ({ ...p, food: { ...p.food, dislikes: v } }))} />
          <TagEditor label="Allergies ⚠️" values={pet.food.allergies} onChange={(v) => set((p) => ({ ...p, food: { ...p.food, allergies: v } }))} />
        </div>
        <div className="field" style={{ marginTop: '0.6rem' }}>
          <label>Diet notes & feeding schedule</label>
          <textarea className="input" rows={3} placeholder="e.g. 3 meals/day, wet food morning & night, dry food kibble for the afternoon…" value={pet.food.diet} onChange={(e) => set((p) => ({ ...p, food: { ...p.food, diet: e.target.value } }))} />
        </div>
      </div>

      {/* tricks */}
      <div className="card pad">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3>💡 Handling tricks</h3>
          <button className="btn sm" onClick={addTrick}>＋ Add trick</button>
        </div>
        <p className="faint" style={{ fontSize: '0.85rem', margin: '0.3rem 0' }}>
          Little hacks for daily life — e.g. "shake the dry-food cover to get {pet.name} down from a height".
        </p>
        <div className="list" style={{ marginTop: '0.4rem' }}>
          {pet.tricks.length === 0 && <p className="faint">No tricks yet.</p>}
          {pet.tricks.map((t) => (
            <div className="card pad" key={t.id} style={{ background: 'var(--bg-sunken)' }}>
              <div className="field"><label>Situation</label><input className="input" value={t.situation} placeholder="Get momo to drink water" onChange={(e) => updateTrick(t.id, { situation: e.target.value })} /></div>
              <div className="field" style={{ marginTop: '0.4rem' }}><label>What works</label><input className="input" value={t.method} placeholder="Drop a few dry-food nibbles into the bowl" onChange={(e) => updateTrick(t.id, { method: e.target.value })} /></div>
              <div className="row" style={{ justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                <button className="btn ghost sm danger" onClick={() => removeTrick(t.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
