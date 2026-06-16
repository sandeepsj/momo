import { useState } from 'react'
import { usePets } from '@/context/PetProvider'
import { Modal } from '@/components/ui'
import { fmtDate, toDateInput, fromDateInput, relativeDue, daysUntil, uid } from '@/lib/format'
import type { Reminder, ReminderKind } from '@/types'

const KINDS: { value: ReminderKind; label: string; emoji: string }[] = [
  { value: 'vaccination', label: 'Vaccination', emoji: '💉' },
  { value: 'deworming', label: 'Deworming', emoji: '🪱' },
  { value: 'tick-flea', label: 'Tick & flea', emoji: '🐜' },
  { value: 'grooming', label: 'Grooming', emoji: '✂️' },
  { value: 'vet-checkup', label: 'Vet check-up', emoji: '🩺' },
  { value: 'custom', label: 'Custom', emoji: '⏰' },
]
const emojiFor = (k: ReminderKind) => KINDS.find((x) => x.value === k)?.emoji ?? '⏰'

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export default function Reminders() {
  const { current, mutate } = usePets()
  const pet = current!.pet
  const [editing, setEditing] = useState<Reminder | null>(null)
  const [isNew, setIsNew] = useState(false)

  const open = pet.reminders.filter((r) => !r.done).sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
  const done = pet.reminders.filter((r) => r.done).sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1))

  const startNew = () => {
    setEditing({ id: uid(), kind: 'custom', title: '', dueDate: new Date().toISOString(), recurrenceDays: undefined, done: false, notes: '' })
    setIsNew(true)
  }
  const save = () => {
    if (!editing || !editing.title.trim()) return
    mutate((p) => ({
      ...p,
      reminders: isNew ? [...p.reminders, editing] : p.reminders.map((r) => (r.id === editing.id ? editing : r)),
    }))
    setEditing(null)
  }
  const remove = (id: string) => mutate((p) => ({ ...p, reminders: p.reminders.filter((r) => r.id !== id) }))

  // Mark done: recurring ones roll forward and stay open; one-offs get archived.
  const complete = (r: Reminder) =>
    mutate((p) => ({
      ...p,
      reminders: p.reminders.map((x) =>
        x.id !== r.id
          ? x
          : r.recurrenceDays
            ? { ...x, dueDate: addDays(new Date().toISOString(), r.recurrenceDays) }
            : { ...x, done: true },
      ),
    }))
  const reopen = (id: string) => mutate((p) => ({ ...p, reminders: p.reminders.map((r) => (r.id === id ? { ...r, done: false } : r)) }))

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>⏰ Reminders</h1>
          <p className="sub">Vaccines, deworming, tick spots & more — never miss one.</p>
        </div>
        <div className="spacer" />
        <button className="btn primary" onClick={startNew}>＋ Add reminder</button>
      </div>

      <div className="list">
        {open.length === 0 && <div className="card empty"><div className="big">✅</div><p>All caught up!</p></div>}
        {open.map((r) => {
          const d = daysUntil(r.dueDate)
          const cls = d !== null && d < 0 ? 'due-over' : d !== null && d <= 7 ? 'due-soon' : 'faint'
          return (
            <div className="card item" key={r.id}>
              <button className="btn ghost sm" title="Mark done" onClick={() => complete(r)} style={{ fontSize: '1.1rem' }}>⬜</button>
              <div className="body">
                <b>{emojiFor(r.kind)} {r.title}</b>
                <span className={cls} style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  due {fmtDate(r.dueDate)} · {relativeDue(r.dueDate)}
                  {r.recurrenceDays ? ` · every ${r.recurrenceDays}d` : ''}
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

      {done.length > 0 && (
        <>
          <div className="section-title">Completed</div>
          <div className="list">
            {done.map((r) => (
              <div className="card item done" key={r.id}>
                <button className="btn ghost sm" title="Reopen" onClick={() => reopen(r.id)} style={{ fontSize: '1.1rem' }}>✅</button>
                <div className="body"><b>{emojiFor(r.kind)} {r.title}</b></div>
                <div className="actions"><button className="btn ghost sm danger" onClick={() => remove(r.id)}>✕</button></div>
              </div>
            ))}
          </div>
        </>
      )}

      {editing && (
        <Modal title={isNew ? 'Add reminder' : 'Edit reminder'} onClose={() => setEditing(null)}>
          <div className="form-grid">
            <div className="field"><label>Title</label><input className="input" autoFocus value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div className="grid cols-2">
              <div className="field">
                <label>Type</label>
                <select className="input" value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value as ReminderKind })}>
                  {KINDS.map((k) => <option key={k.value} value={k.value}>{k.emoji} {k.label}</option>)}
                </select>
              </div>
              <div className="field"><label>Due date</label><input className="input" type="date" value={toDateInput(editing.dueDate)} onChange={(e) => setEditing({ ...editing, dueDate: fromDateInput(e.target.value) })} /></div>
            </div>
            <div className="field">
              <label>Repeat every (days) — leave blank for one-off</label>
              <input className="input" type="number" value={editing.recurrenceDays ?? ''} placeholder="e.g. 30" onChange={(e) => setEditing({ ...editing, recurrenceDays: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
            <div className="field"><label>Notes</label><textarea className="input" rows={2} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></div>
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
