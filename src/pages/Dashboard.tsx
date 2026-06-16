import { Link } from 'react-router-dom'
import { usePets } from '@/context/PetProvider'
import { Avatar } from '@/components/ui'
import { ageFrom, fmtDate, relativeDue, daysUntil } from '@/lib/format'
import { syllabusById, allSkillIds } from '@/data/syllabi'

export default function Dashboard() {
  const { current } = usePets()
  const pet = current!.pet

  const syllabus = syllabusById(pet.training.templateId, pet.species)
  const totalSkills = allSkillIds(syllabus).length
  const doneSkills = Object.keys(pet.training.completed).length
  const trainingPct = totalSkills ? Math.round((doneSkills / totalSkills) * 100) : 0

  const upcoming = [...pet.reminders]
    .filter((r) => !r.done)
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
    .slice(0, 4)

  const recentEvents = [...pet.events].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 4)

  return (
    <div className="page">
      <div className="card pad hero" style={{ borderTop: `4px solid ${pet.accent}` }}>
        <Avatar className="pic" fileId={pet.avatarFileId} emoji={pet.emoji} />
        <div className="info">
          <h1>{pet.name}</h1>
          <p className="muted">
            {[pet.breed, pet.species].filter(Boolean).join(' · ')}
            {pet.birthday && <> · {ageFrom(pet.birthday)}</>}
          </p>
          {pet.birthday && (
            <p className="faint" style={{ fontSize: '0.85rem' }}>🎂 Born {fmtDate(pet.birthday)}</p>
          )}
        </div>
      </div>

      <div className="grid cols-3">
        <Link to="/events" className="card pad stat">
          <div className="n">{pet.events.length}</div>
          <div className="l">events logged</div>
        </Link>
        <Link to="/reminders" className="card pad stat">
          <div className="n">{pet.reminders.filter((r) => !r.done).length}</div>
          <div className="l">open reminders</div>
        </Link>
        <Link to="/training" className="card pad stat">
          <div className="n">{trainingPct}%</div>
          <div className="l">training done</div>
        </Link>
      </div>

      <div className="grid cols-2">
        <div className="card pad">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3>⏰ Coming up</h3>
            <Link to="/reminders" className="btn ghost sm">All</Link>
          </div>
          <div className="list" style={{ marginTop: '0.6rem' }}>
            {upcoming.length === 0 && <p className="faint">Nothing due — nice and relaxed. 😺</p>}
            {upcoming.map((r) => {
              const d = daysUntil(r.dueDate)
              const cls = d !== null && d < 0 ? 'due-over' : d !== null && d <= 7 ? 'due-soon' : ''
              return (
                <div className="row" key={r.id} style={{ justifyContent: 'space-between' }}>
                  <span>{r.title}</span>
                  <span className={cls} style={{ fontSize: '0.85rem', fontWeight: 700 }}>{relativeDue(r.dueDate)}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card pad">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3>📅 Recent moments</h3>
            <Link to="/events" className="btn ghost sm">All</Link>
          </div>
          <div className="list" style={{ marginTop: '0.6rem' }}>
            {recentEvents.length === 0 && <p className="faint">No events yet — log a first memory!</p>}
            {recentEvents.map((e) => (
              <div className="row" key={e.id} style={{ justifyContent: 'space-between' }}>
                <span>{e.title}</span>
                <span className="faint" style={{ fontSize: '0.82rem' }}>{fmtDate(e.date)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pet.story && (
        <div className="card pad">
          <h3>📖 Our story</h3>
          <p className="muted" style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
            {pet.story.length > 320 ? pet.story.slice(0, 320) + '…' : pet.story}
          </p>
          <Link to="/profile" className="btn ghost sm" style={{ marginTop: '0.6rem' }}>Read & edit</Link>
        </div>
      )}

      {pet.tricks.length > 0 && (
        <div className="card pad">
          <h3>💡 Handling tricks</h3>
          <div className="list" style={{ marginTop: '0.6rem' }}>
            {pet.tricks.slice(0, 3).map((t) => (
              <div key={t.id}>
                <b>{t.situation}</b>
                <p className="muted" style={{ fontSize: '0.9rem' }}>{t.method}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
