import { usePets } from '@/context/PetProvider'
import { syllabusById, allSkillIds } from '@/data/syllabi'
import { fmtDate } from '@/lib/format'

export default function Training() {
  const { current, mutate } = usePets()
  const pet = current!.pet
  const syllabus = syllabusById(pet.training.templateId, pet.species)
  const completed = pet.training.completed

  const allIds = allSkillIds(syllabus)
  const doneCount = allIds.filter((id) => completed[id]).length
  const pct = allIds.length ? Math.round((doneCount / allIds.length) * 100) : 0
  const graduated = doneCount === allIds.length && allIds.length > 0

  const toggle = (skillId: string) =>
    mutate((p) => {
      const next = { ...p.training.completed }
      if (next[skillId]) delete next[skillId]
      else next[skillId] = { doneAt: new Date().toISOString(), notes: '' }
      return { ...p, training: { ...p.training, completed: next } }
    })

  const levelComplete = (skills: { id: string }[]) => skills.every((s) => completed[s.id])

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>🎓 Training roadmap</h1>
          <p className="sub">{syllabus.title} — {pet.name}'s journey to graduation.</p>
        </div>
      </div>

      <div className="card pad">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <b>{graduated ? '🏆 Graduated! What a star.' : `${doneCount} of ${allIds.length} skills`}</b>
          <span className="chip">{pct}%</span>
        </div>
        <div className="progress-bar"><div style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="card pad">
        <div className="roadmap">
          {syllabus.levels.map((level) => {
            const complete = levelComplete(level.skills)
            return (
              <div className={`level${complete ? ' complete' : ''}`} key={level.id}>
                <div className="rail">
                  <div className="node">{complete ? '✓' : level.emoji}</div>
                  <div className="line" />
                </div>
                <div className="content">
                  <h3>{level.title} {complete && <span className="chip">done</span>}</h3>
                  <p className="muted" style={{ fontSize: '0.88rem', marginBottom: '0.4rem' }}>{level.blurb}</p>
                  {level.skills.map((sk) => {
                    const isDone = !!completed[sk.id]
                    return (
                      <label className={`skill${isDone ? ' done' : ''}`} key={sk.id}>
                        <input type="checkbox" checked={isDone} onChange={() => toggle(sk.id)} />
                        <span>
                          <b className="sk-title">{sk.title}</b>
                          {isDone && completed[sk.id].doneAt && (
                            <span className="faint" style={{ fontSize: '0.75rem' }}> · {fmtDate(completed[sk.id].doneAt)}</span>
                          )}
                          <span className="tip">{sk.tip}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <p className="faint" style={{ fontSize: '0.82rem', textAlign: 'center' }}>
        Roadmap auto-tailored for {pet.species}s. Check off skills as {pet.name} masters them — go at their pace. 🐾
      </p>
    </div>
  )
}
