import { useState } from 'react'
import { usePets } from '@/context/PetProvider'
import { Modal, ModalActions } from '@/components/ui'
import { Icon, kindMeta } from '@/components/icons'
import { fmtDateShort, relativeDue, dueColor, toDateInput, fromDateInput, uid } from '@/lib/format'
import type { Reminder, ReminderKind } from '@/types'

const KIND_OPTIONS: { value: ReminderKind; label: string }[] = [
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'deworming', label: 'Deworming' },
  { value: 'tick-flea', label: 'Tick & flea' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'vet-checkup', label: 'Vet check-up' },
  { value: 'custom', label: 'Custom' },
]

interface Draft { id: string; kind: ReminderKind; title: string; dueDate: string; recur: string; notes: string }

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export default function Reminders() {
  const { current, mutate } = usePets()
  const pet = current!.pet
  const [modal, setModal] = useState<{ isNew: boolean; draft: Draft } | null>(null)

  const open = pet.reminders.filter((r) => !r.done).sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
  const done = pet.reminders.filter((r) => r.done)

  const complete = (r: Reminder) => mutate((p) => ({ ...p, reminders: p.reminders.map((x) => (x.id !== r.id ? x : r.recurrenceDays ? { ...x, dueDate: addDays(r.recurrenceDays) } : { ...x, done: true })) }))
  const reopen = (id: string) => mutate((p) => ({ ...p, reminders: p.reminders.map((x) => (x.id === id ? { ...x, done: false } : x)) }))
  const remove = (id: string) => mutate((p) => ({ ...p, reminders: p.reminders.filter((x) => x.id !== id) }))

  const startNew = () => setModal({ isNew: true, draft: { id: uid(), kind: 'custom', title: '', dueDate: addDays(0), recur: '', notes: '' } })
  const startEdit = (r: Reminder) => setModal({ isNew: false, draft: { id: r.id, kind: r.kind, title: r.title, dueDate: r.dueDate, recur: r.recurrenceDays ? String(r.recurrenceDays) : '', notes: r.notes } })
  const patch = (p: Partial<Draft>) => setModal((m) => (m ? { ...m, draft: { ...m.draft, ...p } } : m))
  const save = () => {
    if (!modal || !modal.draft.title.trim()) return
    const d = modal.draft
    const rem: Reminder = { id: d.id, kind: d.kind, title: d.title, dueDate: d.dueDate, recurrenceDays: d.recur ? Number(d.recur) : undefined, done: false, notes: d.notes }
    mutate((p) => ({ ...p, reminders: modal.isNew ? [...p.reminders, rem] : p.reminders.map((x) => (x.id === rem.id ? { ...x, ...rem } : x)) }))
    setModal(null)
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, marginBottom: 22, animation: 'rise .5s both' }}>
        <div>
          <h1 className="h1">Care <span className="hl">reminders</span></h1>
          <p className="muted" style={{ margin: '4px 0 0' }}>Vaccines, deworming, tick spots &amp; more — never miss one.</p>
        </div>
        <button className="btn primary" onClick={startNew}>＋ Add reminder</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {open.length === 0 && (
          <div className="card" style={{ padding: 46, textAlign: 'center', animation: 'pop .4s both' }}>
            <div style={{ color: 'var(--ok)', display: 'flex', justifyContent: 'center' }}><Icon name="check" size={42} sw={1.7} /></div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 18, color: 'var(--ink-soft)', margin: '8px 0 0' }}>All caught up!</p>
          </div>
        )}
        {open.map((r) => {
          const km = kindMeta(r.kind)
          const soft = `color-mix(in srgb, ${km.color} 16%, transparent)`
          return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--card)', border: '1.5px solid var(--line)', borderLeft: `5px solid ${km.color}`, borderRadius: 20, padding: '15px 18px', boxShadow: 'var(--shadow-sm)', animation: 'rise .45s both' }}>
              <button onClick={() => complete(r)} title="Mark done" style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--line-strong)', background: 'transparent', cursor: 'pointer', flexShrink: 0, transition: 'all .15s' }} onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--ok)')} onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--line-strong)')} />
              <span style={{ width: 38, height: 38, borderRadius: 13, flexShrink: 0, display: 'grid', placeItems: 'center', background: soft, color: km.color, transform: 'rotate(-5deg)' }}><Icon name={km.icon} size={18} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 17 }}>{r.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: soft, color: km.color }}>{km.label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: dueColor(r.dueDate) }}>due {fmtDateShort(r.dueDate)} · {relativeDue(r.dueDate)}</span>
                  {r.recurrenceDays && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--ink-faint)' }}>↻ every {r.recurrenceDays}d</span>}
                </div>
                {r.notes && <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 500, color: 'var(--ink-soft)', margin: '6px 0 0' }}>{r.notes}</p>}
              </div>
              <button className="btn ghost sm" onClick={() => startEdit(r)}>Edit</button>
              <button className="btn ghost sm danger" onClick={() => remove(r.id)}>✕</button>
            </div>
          )
        })}
      </div>

      {done.length > 0 && (
        <>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 12, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-faint)', margin: '26px 0 12px' }}>Completed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {done.map((r) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 15, background: 'var(--card-2)', border: '1.5px solid var(--line)', borderRadius: 18, padding: '13px 18px', opacity: 0.72 }}>
                <button onClick={() => reopen(r.id)} title="Reopen" style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'var(--ok)', color: '#fff', cursor: 'pointer', flexShrink: 0, display: 'grid', placeItems: 'center' }}><Icon name="tick" size={14} sw={3} /></button>
                <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15.5, textDecoration: 'line-through', color: 'var(--ink-soft)' }}>{r.title}</div>
                <button className="btn ghost sm danger" onClick={() => remove(r.id)}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}

      {modal && (
        <Modal title={modal.isNew ? 'Add reminder' : 'Edit reminder'} onClose={() => setModal(null)}>
          <label className="lbl">Title</label>
          <input className="input" autoFocus value={modal.draft.title} onChange={(e) => patch({ title: e.target.value })} placeholder="e.g. Tick & flea spot-on" style={{ marginBottom: 14 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label className="lbl">Type</label>
              <select className="input" value={modal.draft.kind} onChange={(e) => patch({ kind: e.target.value as ReminderKind })}>
                {KIND_OPTIONS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </select>
            </div>
            <div><label className="lbl">Due date</label><input className="input" type="date" value={toDateInput(modal.draft.dueDate)} onChange={(e) => patch({ dueDate: fromDateInput(e.target.value) })} /></div>
          </div>
          <label className="lbl">Repeat every (days) — blank for one-off</label>
          <input className="input" type="number" value={modal.draft.recur} onChange={(e) => patch({ recur: e.target.value })} placeholder="e.g. 30" style={{ marginBottom: 14 }} />
          <label className="lbl">Notes</label>
          <textarea className="input" rows={2} value={modal.draft.notes} onChange={(e) => patch({ notes: e.target.value })} style={{ fontWeight: 500 }} />
          <ModalActions onCancel={() => setModal(null)} onSave={save} saveDisabled={!modal.draft.title.trim()} />
        </Modal>
      )}
    </>
  )
}
