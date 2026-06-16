import { useNavigate } from 'react-router-dom'
import { usePets } from '@/context/PetProvider'
import { StickerHeader } from '@/components/ui'
import { Icon, Paw, eventIconName, kindMeta } from '@/components/icons'
import { ageFrom, fmtDateShort, relativeDue, dueColor } from '@/lib/format'

export default function Dashboard() {
  const { current } = usePets()
  const navigate = useNavigate()
  const pet = current!.pet

  const open = pet.reminders.filter((r) => !r.done).sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
  const wlog = [...pet.medical.weightLog].sort((a, b) => (a.date < b.date ? -1 : 1))
  const latest = wlog[wlog.length - 1]
  const prev = wlog[wlog.length - 2]
  const weightLatest = latest ? latest.kg.toFixed(1) : '—'
  let weightTrend = 'tracking'
  if (latest && prev) {
    const d = latest.kg - prev.kg
    weightTrend = d === 0 ? 'steady' : d > 0 ? `▲ ${d.toFixed(1)}` : `▼ ${Math.abs(d).toFixed(1)}`
  }
  const recent = [...pet.events].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 4)
  const heroSub = [pet.breed, pet.species, ageFrom(pet.birthday)].filter(Boolean).join(' · ')

  return (
    <>
      {/* hero */}
      <div style={{ position: 'relative', borderRadius: '40px 40px 40px 16px', overflow: 'hidden', background: 'linear-gradient(140deg,var(--accent),color-mix(in srgb,var(--accent) 50%,var(--accent-2)))', padding: '34px 32px 30px', boxShadow: '0 22px 46px -18px var(--accent)', animation: 'rise .5s both', marginBottom: 20 }}>
        <Paw size={150} fill="rgba(255,255,255,.14)" style={{ position: 'absolute', right: -12, top: -16, transform: 'rotate(18deg)' }} />
        <Paw size={70} fill="rgba(255,255,255,.12)" style={{ position: 'absolute', left: '34%', bottom: -22, transform: 'rotate(-12deg)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, position: 'relative' }}>
          <div style={{ width: 100, height: 100, borderRadius: 30, background: 'rgba(255,255,255,.95)', display: 'grid', placeItems: 'center', fontSize: 56, flexShrink: 0, transform: 'rotate(-4deg)', boxShadow: '0 12px 26px -8px rgba(0,0,0,.32)' }}>{pet.emoji}</div>
          <div style={{ color: '#fff' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 42, letterSpacing: '-.02em', margin: 0, lineHeight: 1 }}>{pet.name}</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 16, margin: '7px 0 0', opacity: 0.95, textTransform: 'capitalize' }}>{heroSub}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 13, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, padding: '5px 11px', borderRadius: 999, background: 'rgba(255,255,255,.22)', color: '#fff' }}><Icon name="cake" size={14} sw={2.2} /> {pet.birthday ? fmtDateShort(pet.birthday) : 'add birthday'}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, padding: '5px 11px', borderRadius: 999, background: 'rgba(255,255,255,.22)', color: '#fff' }}><Icon name="home" size={14} sw={2.2} /> {pet.adoptionDate ? fmtDateShort(pet.adoptionDate) : 'add gotcha day'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* stat tiles */}
      <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        <button className="statcard" onClick={() => navigate('/reminders')} style={{ position: 'relative', cursor: 'pointer', textAlign: 'left', background: 'var(--accent-soft)', border: '1.5px solid var(--line)', borderRadius: '24px 24px 24px 10px', padding: 20, boxShadow: 'var(--shadow-sm)', transition: 'all .22s', animation: 'rise .5s .05s both', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: 11, display: 'grid', placeItems: 'center', color: 'var(--accent-ink)', background: 'var(--card)', transform: 'rotate(-8deg)', boxShadow: 'var(--shadow-sm)' }}><Icon name="bell" size={16} /></span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 40, lineHeight: 1, color: 'var(--accent-ink)' }}>{open.length}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13, color: 'var(--ink-soft)', marginTop: 6 }}>care tasks due</div>
        </button>
        <button className="statcard" onClick={() => navigate('/medical')} style={{ position: 'relative', cursor: 'pointer', textAlign: 'left', background: 'var(--mint-soft)', border: '1.5px solid var(--line)', borderRadius: 24, padding: 20, boxShadow: 'var(--shadow-sm)', transition: 'all .22s', animation: 'rise .5s .1s both', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: 11, display: 'grid', placeItems: 'center', color: 'var(--mint)', background: 'var(--card)', transform: 'rotate(7deg)', boxShadow: 'var(--shadow-sm)' }}><Icon name="scale" size={16} /></span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 40, lineHeight: 1, color: 'var(--mint)' }}>{weightLatest}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13, color: 'var(--ink-soft)', marginTop: 6 }}>kg · {weightTrend}</div>
        </button>
        <button className="statcard" onClick={() => navigate('/profile')} style={{ position: 'relative', cursor: 'pointer', textAlign: 'left', background: 'var(--sky-soft)', border: '1.5px solid var(--line)', borderRadius: '24px 24px 10px 24px', padding: 20, boxShadow: 'var(--shadow-sm)', transition: 'all .22s', animation: 'rise .5s .15s both', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: 11, display: 'grid', placeItems: 'center', color: 'var(--sky)', background: 'var(--card)', transform: 'rotate(-6deg)', boxShadow: 'var(--shadow-sm)' }}><Icon name="spark" size={16} /></span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 40, lineHeight: 1, color: 'var(--sky)' }}>{pet.events.length}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13, color: 'var(--ink-soft)', marginTop: 6 }}>moments logged</div>
        </button>
      </div>

      {/* coming up + recent moments */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
        <div className="card pad" style={{ animation: 'rise .5s .2s both' }}>
          <StickerHeader icon="clock" title="Coming up" action={<button className="btn ghost sm" onClick={() => navigate('/reminders')}>All</button>} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {open.length === 0 && <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-faint)', fontWeight: 600, margin: 0 }}>All caught up — relax. 😺</p>}
            {open.slice(0, 4).map((r) => {
              const km = kindMeta(r.kind)
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center', background: `color-mix(in srgb, ${km.color} 16%, transparent)`, color: km.color }}><Icon name={km.icon} size={18} /></span>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14.5, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, color: dueColor(r.dueDate) }}>{relativeDue(r.dueDate)}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="card pad" style={{ animation: 'rise .5s .25s both' }}>
          <StickerHeader icon="cal" title="Recent moments" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {recent.length === 0 && <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-faint)', fontWeight: 600, margin: 0 }}>No moments yet.</p>}
            {recent.map((e) => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ width: 30, height: 30, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}><Icon name={eventIconName(e.type)} size={16} /></span>
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14.5, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: 'var(--ink-faint)' }}>{fmtDateShort(e.date)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* story */}
      <div className="card pad" style={{ position: 'relative', animation: 'rise .5s .3s both', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -12, left: '50%', width: 120, height: 28, background: 'color-mix(in srgb,var(--accent) 35%,transparent)', transform: 'translateX(-50%) rotate(-2deg)', opacity: 0.55 }} />
        <div style={{ position: 'relative' }}>
          <StickerHeader icon="book" title="Our story" mb={12} />
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 15.5, lineHeight: 1.75, color: 'var(--ink-soft)', margin: 0, maxWidth: 640 }}>
            {pet.story ? (pet.story.length > 300 ? pet.story.slice(0, 300) + '…' : pet.story) : 'No story yet — tap to write how you two met.'}
          </p>
          <button className="btn sm" onClick={() => navigate('/profile')} style={{ marginTop: 14 }}>Read &amp; edit →</button>
        </div>
      </div>
    </>
  )
}
