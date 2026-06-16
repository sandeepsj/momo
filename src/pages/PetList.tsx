import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePets } from '@/context/PetProvider'
import { SPECIES_PRESETS } from '@/data/petKinds'
import type { Species } from '@/types'
import { Modal } from '@/components/ui'

export default function PetList() {
  const { pets, select, createPet, auth, logout } = usePets()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const [species, setSpecies] = useState<Species>('cat')

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
    <div className="page" style={{ maxWidth: 760 }}>
      <div className="page-head">
        <div>
          <h1>🐾 Your pets</h1>
          <p className="sub">Pick a companion, or add a new one.</p>
        </div>
        <div className="spacer" />
        <div className="user-pill" title={auth.user.email}>
          <img src={auth.user.picture} alt="" referrerPolicy="no-referrer" />
          <button className="btn ghost sm" onClick={logout}>Sign out</button>
        </div>
      </div>

      <div className="pet-grid">
        {pets.map((p) => (
          <button
            key={p.fileId}
            className="card pet-card"
            style={{ borderTop: `4px solid ${p.accent}` }}
            onClick={() => open(p.fileId)}
          >
            <div className="emoji">{p.emoji}</div>
            <h3>{p.name}</h3>
            <span className="muted" style={{ fontSize: '0.82rem' }}>{p.species}</span>
          </button>
        ))}
        <button className="card pet-card add" onClick={() => setAdding(true)}>
          <div className="emoji">＋</div>
          <span>Add a pet</span>
        </button>
      </div>

      {adding && (
        <Modal title="Add a pet" onClose={() => setAdding(false)}>
          <div className="form-grid">
            <div className="field">
              <label>Name</label>
              <input className="input" autoFocus value={name} placeholder="e.g. momo" onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>Species</label>
              <div className="row">
                {SPECIES_PRESETS.map((s) => (
                  <button
                    key={s.species}
                    type="button"
                    className={`btn sm${species === s.species ? ' primary' : ''}`}
                    onClick={() => setSpecies(s.species)}
                  >
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="faint" style={{ fontSize: '0.82rem' }}>
              We'll seed a care schedule and a {SPECIES_PRESETS.find((s) => s.species === species)?.label.toLowerCase()} training roadmap automatically.
            </p>
          </div>
          <div className="modal-actions">
            <button className="btn ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn primary" onClick={submit} disabled={busy || !name.trim()}>
              {busy ? <span className="spin" /> : 'Create'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
