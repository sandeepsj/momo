import { useState } from 'react'
import { usePets } from '@/context/PetProvider'
import { Modal } from '@/components/ui'
import { fmtDate, toDateInput, fromDateInput, uid } from '@/lib/format'
import type { EventType, PetEvent } from '@/types'

const TYPES: { value: EventType; label: string; emoji: string }[] = [
  { value: 'milestone', label: 'Milestone', emoji: '⭐' },
  { value: 'firsts', label: 'First time', emoji: '🌱' },
  { value: 'vet', label: 'Vet', emoji: '🩺' },
  { value: 'grooming', label: 'Grooming', emoji: '✂️' },
  { value: 'adventure', label: 'Adventure', emoji: '🧭' },
  { value: 'funny', label: 'Funny', emoji: '😹' },
  { value: 'other', label: 'Other', emoji: '📌' },
]
const emojiFor = (t: EventType) => TYPES.find((x) => x.value === t)?.emoji ?? '📌'

const blank = (): PetEvent => ({
  id: uid(),
  date: new Date().toISOString(),
  type: 'milestone',
  title: '',
  notes: '',
})

export default function Events() {
  const { current, mutate } = usePets()
  const pet = current!.pet
  const [editing, setEditing] = useState<PetEvent | null>(null)
  const [isNew, setIsNew] = useState(false)

  const sorted = [...pet.events].sort((a, b) => (a.date < b.date ? 1 : -1))

  const startNew = () => {
    setEditing(blank())
    setIsNew(true)
  }
  const startEdit = (e: PetEvent) => {
    setEditing({ ...e })
    setIsNew(false)
  }
  const save = () => {
    if (!editing || !editing.title.trim()) return
    mutate((p) =>
      isNew
        ? { ...p, events: [...p.events, editing] }
        : { ...p, events: p.events.map((e) => (e.id === editing.id ? editing : e)) },
    )
    setEditing(null)
  }
  const remove = (id: string) => mutate((p) => ({ ...p, events: p.events.filter((e) => e.id !== id) }))

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>📅 Events</h1>
          <p className="sub">{pet.name}'s timeline of moments & milestones.</p>
        </div>
        <div className="spacer" />
        <button className="btn primary" onClick={startNew}>＋ Add event</button>
      </div>

      {sorted.length === 0 ? (
        <div className="card empty">
          <div className="big">📅</div>
          <p>No events yet. Log the first one!</p>
        </div>
      ) : (
        <div className="list">
          {sorted.map((e) => (
            <div className="card item" key={e.id}>
              <span className="when">{fmtDate(e.date)}</span>
              <div className="body">
                <b>{emojiFor(e.type)} {e.title}</b>
                {e.notes && <p className="muted" style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{e.notes}</p>}
              </div>
              <div className="actions">
                <button className="btn ghost sm" onClick={() => startEdit(e)}>Edit</button>
                <button className="btn ghost sm danger" onClick={() => remove(e.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={isNew ? 'Add event' : 'Edit event'} onClose={() => setEditing(null)}>
          <div className="form-grid">
            <div className="field">
              <label>Title</label>
              <input className="input" autoFocus value={editing.title} placeholder="First trip to the vet" onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="grid cols-2">
              <div className="field">
                <label>Date</label>
                <input className="input" type="date" value={toDateInput(editing.date)} onChange={(e) => setEditing({ ...editing, date: fromDateInput(e.target.value) })} />
              </div>
              <div className="field">
                <label>Type</label>
                <select className="input" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as EventType })}>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Notes</label>
              <textarea className="input" rows={3} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn primary" onClick={save} disabled={!editing.title.trim()}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
