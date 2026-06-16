import { useState } from 'react'
import { usePets } from '@/context/PetProvider'
import { Modal, ModalActions, StickerHeader, TagField } from '@/components/ui'
import { Icon } from '@/components/icons'
import { fmtDateShort, relativeDue, dueColor, toDateInput, fromDateInput, uid } from '@/lib/format'
import type { MedicalRecord, Pet, WeightEntry } from '@/types'

type RecordField = 'vaccinations' | 'deworming' | 'tickFlea'
const GROUPS: { field: RecordField; title: string; icon: 'syringe' | 'worm' | 'bug'; color: string; nameLabel: string }[] = [
  { field: 'vaccinations', title: 'Vaccinations', icon: 'syringe', color: '#6C8CFF', nameLabel: 'Vaccine name' },
  { field: 'deworming', title: 'Deworming', icon: 'worm', color: '#5FA777', nameLabel: 'Product' },
  { field: 'tickFlea', title: 'Tick & flea', icon: 'bug', color: '#E0A458', nameLabel: 'Product / spot-on' },
]

function Sparkline({ log }: { log: WeightEntry[] }) {
  if (log.length === 0) return <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-faint)', fontWeight: 600, margin: '6px 0 0', fontSize: 13.5 }}>No weight logged yet.</p>
  const w = 280, h = 78, pad = 10, n = log.length
  const xs = log.map((_, i) => pad + (i * (w - 2 * pad)) / Math.max(1, n - 1))
  const min = Math.min(...log.map((d) => d.kg))
  const max = Math.max(...log.map((d) => d.kg))
  const span = max - min || 1
  const ys = log.map((d) => h - pad - ((d.kg - min) / span) * (h - 2 * pad))
  const pts = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
  const area = `${pad},${h} ${pts} ${w - pad},${h}`
  const ac = '#5FA777'
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 78, display: 'block', overflow: 'visible' }}>
      <polygon points={area} fill={ac} opacity={0.13} />
      <polyline points={pts} fill="none" stroke={ac} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r={i === n - 1 ? 4.5 : 2.6} fill={i === n - 1 ? ac : 'var(--card)'} stroke={ac} strokeWidth={2} />)}
    </svg>
  )
}

interface RecordDraft { id: string; date: string; name: string; nextDue: string; vet: string; notes: string }

export default function Medical() {
  const { current, mutate } = usePets()
  const pet = current!.pet
  const [kg, setKg] = useState('')
  const [modal, setModal] = useState<{ field: RecordField; nameLabel: string; draft: RecordDraft } | null>(null)

  const wlog = [...pet.medical.weightLog].sort((a, b) => (a.date < b.date ? -1 : 1))
  const latest = wlog[wlog.length - 1]

  const logWeight = () => {
    const v = parseFloat(kg)
    if (isNaN(v)) return
    setKg('')
    mutate((p) => ({ ...p, medical: { ...p.medical, weightLog: [...p.medical.weightLog, { date: new Date().toISOString(), kg: v }] } }))
  }
  const setMed = (key: 'allergies' | 'conditions', v: string[]) => mutate((p) => ({ ...p, medical: { ...p.medical, [key]: v } }))
  const deleteRecord = (field: RecordField, id: string) => mutate((p) => ({ ...p, medical: { ...p.medical, [field]: p.medical[field].filter((r) => r.id !== id) } }))

  const openAdd = (field: RecordField, nameLabel: string) => setModal({ field, nameLabel, draft: { id: uid(), date: new Date().toISOString(), name: '', nextDue: '', vet: '', notes: '' } })
  const saveRecord = () => {
    if (!modal || !modal.draft.name.trim()) return
    const rec: MedicalRecord = { id: modal.draft.id, date: modal.draft.date, name: modal.draft.name, nextDue: modal.draft.nextDue || undefined, vet: modal.draft.vet, notes: modal.draft.notes }
    const field = modal.field
    mutate((p: Pet) => ({ ...p, medical: { ...p.medical, [field]: [...p.medical[field], rec] } }))
    setModal(null)
  }
  const patchDraft = (patch: Partial<RecordDraft>) => setModal((m) => (m ? { ...m, draft: { ...m.draft, ...patch } } : m))

  return (
    <>
      <div style={{ marginBottom: 18, animation: 'rise .5s both' }}>
        <h1 className="h1">Medical <span className="hl">history</span></h1>
        <p className="muted" style={{ margin: '4px 0 0' }}>{pet.name}'s health record — the source of truth for vet visits.</p>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card pad" style={{ animation: 'rise .5s .05s both' }}>
          <div className="section-head" style={{ marginBottom: 10 }}>
            <span className="stkr" style={{ background: 'linear-gradient(145deg,var(--mint),#7cc294)', boxShadow: '0 7px 14px -6px var(--mint),inset 0 1px 0 rgba(255,255,255,.35)' }}><Icon name="scale" size={19} /></span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, margin: 0, flex: 1 }}>Weight</h3>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, color: 'var(--mint)' }}>{latest ? latest.kg.toFixed(1) : '—'}<span style={{ fontSize: 14, color: 'var(--ink-faint)', fontWeight: 500 }}> kg</span></span>
          </div>
          <Sparkline log={wlog} />
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <input className="input" type="number" step="0.01" placeholder="new kg" value={kg} onChange={(e) => setKg(e.target.value)} style={{ flex: 1 }} onKeyDown={(e) => e.key === 'Enter' && logWeight()} />
            <button className="btn primary sm" onClick={logWeight}>Log</button>
          </div>
        </div>

        <div className="card pad" style={{ animation: 'rise .5s .1s both' }}>
          <StickerHeader icon="heart" title="Health profile" mb={14} />
          <div style={{ marginBottom: 14 }}>
            <label className="lbl">Allergies</label>
            <TagField values={pet.medical.allergies} onChange={(v) => setMed('allergies', v)} chipStyle={{ background: 'color-mix(in srgb,var(--danger) 15%,transparent)', color: 'var(--danger)' }} />
          </div>
          <div>
            <label className="lbl">Ongoing conditions</label>
            {pet.medical.conditions.length === 0 && <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-faint)', fontWeight: 600, margin: '0 0 7px' }}>None — healthy as can be 🌿</p>}
            <TagField values={pet.medical.conditions} onChange={(v) => setMed('conditions', v)} />
          </div>
        </div>
      </div>

      {GROUPS.map((g) => {
        const records = [...pet.medical[g.field]].sort((a, b) => (a.date < b.date ? 1 : -1))
        return (
          <div key={g.field} className="card pad" style={{ marginBottom: 14, animation: 'rise .5s both' }}>
            <StickerHeader icon={g.icon} color={g.color} title={g.title} mb={14} action={<button className="btn sm" onClick={() => openAdd(g.field, g.nameLabel)}>＋ Add</button>} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {records.length === 0 && <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-faint)', fontWeight: 600, margin: 0 }}>None recorded yet.</p>}
              {records.map((r) => (
                <div key={r.id} className="recrow" style={{ display: 'flex', gap: 14, padding: '13px 10px', borderTop: '1.5px dashed var(--line-strong)', borderRadius: 12, transition: 'background .15s', margin: '0 -10px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, color: 'var(--ink-faint)', width: 60, flexShrink: 0, paddingTop: 2 }}>{fmtDateShort(r.date)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16 }}>{r.name}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink-faint)', marginTop: 2 }}>
                      {r.vet ? `by ${r.vet}` : ''}
                      {r.nextDue && <span style={{ color: dueColor(r.nextDue) }}>{r.vet ? ' · ' : ''}next due {fmtDateShort(r.nextDue)} ({relativeDue(r.nextDue)})</span>}
                    </div>
                    {r.notes && <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 500, color: 'var(--ink-soft)', margin: '5px 0 0' }}>{r.notes}</p>}
                  </div>
                  <button className="btn ghost sm danger" onClick={() => deleteRecord(g.field, r.id)} style={{ alignSelf: 'flex-start' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {modal && (
        <Modal title={`Add ${modal.nameLabel.toLowerCase()}`} onClose={() => setModal(null)}>
          <label className="lbl">{modal.nameLabel}</label>
          <input className="input" autoFocus value={modal.draft.name} onChange={(e) => patchDraft({ name: e.target.value })} style={{ marginBottom: 14 }} />
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div><label className="lbl">Date given</label><input className="input" type="date" value={toDateInput(modal.draft.date)} onChange={(e) => patchDraft({ date: fromDateInput(e.target.value) })} /></div>
            <div><label className="lbl">Next due</label><input className="input" type="date" value={toDateInput(modal.draft.nextDue)} onChange={(e) => patchDraft({ nextDue: fromDateInput(e.target.value) })} /></div>
          </div>
          <label className="lbl">Vet / clinic</label>
          <input className="input" value={modal.draft.vet} onChange={(e) => patchDraft({ vet: e.target.value })} style={{ marginBottom: 14 }} />
          <label className="lbl">Notes</label>
          <textarea className="input" rows={2} value={modal.draft.notes} onChange={(e) => patchDraft({ notes: e.target.value })} style={{ fontWeight: 500 }} />
          <ModalActions onCancel={() => setModal(null)} onSave={saveRecord} saveDisabled={!modal.draft.name.trim()} />
        </Modal>
      )}
    </>
  )
}
