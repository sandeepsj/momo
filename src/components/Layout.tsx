import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { usePets } from '@/context/PetProvider'
import { useTheme } from '@/context/ThemeProvider'
import Backdrop from '@/components/Backdrop'
import { DOCK_GLYPHS, Icon, ThemeGlyph } from '@/components/icons'

const DOCK = [
  { to: '/dashboard', glyph: 'home', label: 'Home' },
  { to: '/profile', glyph: 'profile', label: 'Profile' },
  { to: '/medical', glyph: 'medical', label: 'Medical' },
  { to: '/prescriptions', glyph: 'rx', label: 'Rx' },
  { to: '/reminders', glyph: 'care', label: 'Care' },
] as const

export default function Layout() {
  const { current, saving } = usePets()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Tint the whole app (incl. the fixed backdrop) with the pet's accent.
  useEffect(() => {
    if (current) document.documentElement.style.setProperty('--accent', current.pet.accent)
    return () => {
      document.documentElement.style.removeProperty('--accent')
    }
  }, [current])

  if (!current) return <Navigate to="/" replace />
  const pet = current.pet
  const saved = saving === 'saved' || saving === 'idle'

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      <Backdrop />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 920, margin: '0 auto', padding: '0 22px' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 40, display: 'flex', alignItems: 'center', gap: 13, padding: '18px 0 14px', background: 'linear-gradient(var(--bg) 72%, transparent)' }}>
          <button onClick={() => navigate('/')} title="Switch pet" style={{ display: 'flex', alignItems: 'center', gap: 11, border: 'none', background: 'none', cursor: 'pointer', padding: 4, borderRadius: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: 15, background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', fontSize: 25, transform: 'rotate(-5deg)', boxShadow: 'var(--sticker)' }}>{pet.emoji}</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, lineHeight: 1.05 }}>{pet.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'var(--ink-faint)' }}>switch pet ⌄</div>
            </div>
          </button>
          <div style={{ flex: 1 }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 700, color: saved ? 'var(--ok)' : 'var(--ink-faint)' }}>
            {saving === 'saving' ? <span className="spin dark" /> : <Icon name="check" size={15} sw={2.6} />}
            {saving === 'saving' ? 'Saving…' : saving === 'error' ? 'Save failed' : 'Saved'}
          </span>
          <button className="iconbtn" onClick={toggle} title="Toggle theme"><ThemeGlyph dark={theme === 'dark'} /></button>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', color: 'var(--accent-ink)' }}><Icon name="user" size={19} /></div>
        </header>

        <main style={{ padding: '10px 0 150px' }}>
          <Outlet />
        </main>
      </div>

      <nav className="dock">
        {DOCK.map((d) => (
          <button key={d.to} className={`dockbtn${pathname === d.to ? ' on' : ''}`} onClick={() => navigate(d.to)}>
            {DOCK_GLYPHS[d.glyph]}
            <span>{d.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
