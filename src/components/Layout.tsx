import { useEffect } from 'react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { usePets } from '@/context/PetProvider'
import { Avatar, SaveBadge } from '@/components/ui'

const NAV = [
  { to: '/dashboard', ico: '🏠', label: 'Dashboard' },
  { to: '/profile', ico: '🪪', label: 'Profile' },
  { to: '/events', ico: '📅', label: 'Events' },
  { to: '/medical', ico: '🩺', label: 'Medical' },
  { to: '/prescriptions', ico: '📃', label: 'Prescriptions' },
  { to: '/reminders', ico: '⏰', label: 'Reminders' },
  { to: '/training', ico: '🎓', label: 'Training' },
  { to: '/gallery', ico: '🖼️', label: 'Gallery' },
]

export default function Layout() {
  const { current, auth, saving, logout } = usePets()
  const navigate = useNavigate()

  // Tint the whole app with the current pet's accent colour.
  useEffect(() => {
    if (current) document.body.style.setProperty('--accent', current.pet.accent)
    return () => {
      document.body.style.removeProperty('--accent')
    }
  }, [current])

  if (!current) return <Navigate to="/" replace />
  const pet = current.pet

  return (
    <div className="shell">
      <aside className="sidebar">
        <button className="brand" style={{ border: 'none', background: 'none', textAlign: 'left' }} onClick={() => navigate('/')}>
          <Avatar className="avatar" fileId={pet.avatarFileId} emoji={pet.emoji} />
          <span className="meta">
            <b>{pet.name}</b>
            <span>switch pet ⌄</span>
          </span>
        </button>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="ico">{n.ico}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
        <div className="nav-spacer" />
        <button className="nav-link" style={{ border: 'none', background: 'none', width: '100%' }} onClick={logout}>
          <span className="ico">🚪</span>
          <span>Sign out</span>
        </button>
      </aside>

      <div className="main">
        <header className="topbar">
          <strong>{pet.name}</strong>
          <span className="tag">{pet.species}</span>
          <div className="save-state">
            <SaveBadge state={saving} />
          </div>
          <div className="user-pill" title={auth.user.email}>
            <img src={auth.user.picture} alt="" referrerPolicy="no-referrer" />
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  )
}
