import { useState } from 'react'
import { usePets } from '@/context/PetProvider'
import { Modal, TagEditor } from '@/components/ui'
import { fmtDate, toDateInput, fromDateInput, relativeDue, daysUntil, uid } from '@/lib/format'
import type { MedicalRecord, Pet, WeightEntry } from '@/types'

type RecordKey = 'vaccinations' | 'deworming' | 'tickFlea'

function RecordList({
  pet,
  field,
  title,
  emoji,
  nameLabel,
  mutate,
}: {
  pet: Pet
  field: RecordKey
  title: string
  emoji: string
  nameLabel: string
  mutate: (fn: (p: Pet) => Pet) => void
}) {
  const [editing, setEditing] = useState<MedicalRecord | null>(null)
  const [isNew, setIsNew] = useState(false)
  const records = [...pet.medical[field]].sort((a, b) => (a.date < b.date ? 1 : -1))

  const startNew = () => {
    setEditing({ id: uid(), date: new Date().toISOString(), name: '', nextDue: '', vet: '', notes: '' })
    setIsNew(true)
  }
  const save = () => {
    if (!editing || !editing.name.trim()) return
    mutate((p) => ({
      ...p,
      medical: {
        ...p.medical,
        [field]: isNew
          ? [...p.medical[field], editing]
          : p.medical[field].map((r) => (r.id === editing.id ? editing : r)),
      },
    }))
    setEditing(null)
  }
  const remove = (id: string) =>
    mutate((p) => ({ ...p, medical: { ...p.medical, [field]: p.medical[field].filter((r) => r.id !== id) } }))

  return (
    <div className="card pad">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h3>{emoji} {title}</h3>
        <button className="btn sm" onClick={startNew}>＋ Add</button>
      </div>
      <div className="list" style={{ marginTop: '0.6rem' }}>
        {records.length === 0 && <p className="faint">None recorded.</p>}
        {records.map((r) => {
          const d = daysUntil(r.nextDue)
          const cls = d !== null && d < 0 ? 'due-over' : d !== null && d <= 14 ? 'due-soon' : 'faint'
          return (
            <div className="item" key={r.id} style={{ padding: '0.6rem 0' }}>
              <span className="when">{fmtDate(r.date)}</span>
              <div className="body">
                <b>{r.name}</b>
                <span className="faint" style={{ fontSize: '0.82rem' }}>
                  {r.vet && <>by {r.vet}. </>}
                  {r.nextDue && <span className={cls}>next due {fmtDate(r.nextDue)} ({relativeDue(r.nextDue)})</span>}
                </span>
                {r.notes && <p className="muted" style={{ fontSize: '0.88rem' }}>{r.notes}</p>}
              </div>
              <div className="actions">
                <button className="btn ghost sm" onClick={() => { setEditing({ ...r }); setIsNew(false) }}>Edit</button>
                <button className="btn ghost sm danger" onClick={() => remove(r.id)}>✕</button>
              </div>
            </div>
          )
        })}
      </div>

      {editing && (
        <Modal title={`${isNew ? 'Add' : 'Edit'} ${title.toLowerCase()}`} onClose={() => setEditing(null)}>
          <div className="form-grid">
            <div className="field"><label>{nameLabel}</label><input className="input" autoFocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div className="grid cols-2">
              <div className="field"><label>Date given</label><input className="input" type="date" value={toDateInput(editing.date)} onChange={(e) => setEditing({ ...editing, date: fromDateInput(e.target.value) })} /></div>
              <div className="field"><label>Next due</label><input className="input" type="date" value={toDateInput(editing.nextDue)} onChange={(e) => setEditing({ ...editing, nextDue: fromDateInput(e.target.value) })} /></div>
            </div>
            <div className="field"><label>Vet / clinic</label><input className="input" value={editing.vet} onChange={(e) => setEditing({ ...editing, vet: e.target.value })} /></div>
            <div className="field"><label>Notes</label><textarea className="input" rows={2} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></div>
          </div>
          <div className="modal-actions">
            <button className="btn ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn primary" onClick={save} disabled={!editing.name.trim()}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function WeightCard({ pet, mutate }: { pet: Pet; mutate: (fn: (p: Pet) => Pet) => void }) {
  const [kg, setKg] = useState('')
  const log = [...pet.medical.weightLog].sort((a, b) => (a.date < b.date ? 1 : -1))
  const latest = log[0]
  const add = () => {
    const v = parseFloat(kg)
    if (isNaN(v)) return
    const entry: WeightEntry = { date: new Date().toISOString(), kg: v }
    mutate((p) => ({ ...p, medical: { ...p.medical, weightLog: [...p.medical.weightLog, entry] } }))
    setKg('')
  }
  const remove = (date: string) =>
    mutate((p) => ({ ...p, medical: { ...p.medical, weightLog: p.medical.weightLog.filter((w) => w.date !== date) } }))

  return (
    <div className="card pad">
      <h3>⚖️ Weight {latest && <span className="muted" style={{ fontWeight: 400 }}>· now {latest.kg} kg</span>}</h3>
      <div className="row" style={{ marginTop: '0.6rem' }}>
        <input className="input" style={{ maxWidth: 130 }} type="number" step="0.01" placeholder="kg" value={kg} onChange={(e) => setKg(e.target.value)} />
        <button className="btn sm" onClick={add}>Log weight</button>
      </div>
      <div className="list" style={{ marginTop: '0.6rem' }}>
        {log.slice(0, 6).map((w) => (
          <div className="row" key={w.date} style={{ justifyContent: 'space-between' }}>
            <span>{w.kg} kg</span>
            <span className="row" style={{ gap: '0.5rem' }}>
              <span className="faint" style={{ fontSize: '0.82rem' }}>{fmtDate(w.date)}</span>
              <button className="btn ghost sm danger" onClick={() => remove(w.date)}>✕</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Medical() {
  const { current, mutate } = usePets()
  const pet = current!.pet

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>🩺 Medical history</h1>
          <p className="sub">{pet.name}'s health record — the source of truth for vet visits.</p>
        </div>
      </div>

      <div className="card pad">
        <h3>🧬 Health profile</h3>
        <div className="grid cols-2" style={{ marginTop: '0.6rem' }}>
          <TagEditor label="Ongoing conditions" values={pet.medical.conditions} onChange={(v) => mutate((p) => ({ ...p, medical: { ...p.medical, conditions: v } }))} />
          <TagEditor label="Allergies" values={pet.medical.allergies} onChange={(v) => mutate((p) => ({ ...p, medical: { ...p.medical, allergies: v } }))} />
        </div>
        <div className="field" style={{ marginTop: '0.6rem', maxWidth: 200 }}>
          <label>Blood group</label>
          <input className="input" value={pet.medical.bloodGroup} onChange={(e) => mutate((p) => ({ ...p, medical: { ...p.medical, bloodGroup: e.target.value } }))} />
        </div>
      </div>

      <WeightCard pet={pet} mutate={mutate} />
      <RecordList pet={pet} mutate={mutate} field="vaccinations" title="Vaccinations" emoji="💉" nameLabel="Vaccine name" />
      <RecordList pet={pet} mutate={mutate} field="deworming" title="Deworming" emoji="🪱" nameLabel="Product" />
      <RecordList pet={pet} mutate={mutate} field="tickFlea" title="Tick & flea" emoji="🐜" nameLabel="Product / spot" />
    </div>
  )
}
