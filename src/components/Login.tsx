import { useTheme } from '@/context/ThemeProvider'
import Backdrop from '@/components/Backdrop'
import { GoogleG, Icon, Paw, ThemeGlyph } from '@/components/icons'

export default function Login({ onLogin, loading, error }: { onLogin: () => void; loading: boolean; error: string | null }) {
  const { theme, toggle } = useTheme()
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      <Backdrop />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <button className="iconbtn" onClick={toggle} style={{ position: 'fixed', top: 22, right: 22 }}><ThemeGlyph dark={theme === 'dark'} /></button>

        <div style={{ width: 130, height: 130, borderRadius: '42px 42px 42px 16px', background: 'linear-gradient(150deg,var(--accent),color-mix(in srgb,var(--accent) 50%,var(--accent-2)))', display: 'grid', placeItems: 'center', boxShadow: '0 24px 50px -18px var(--accent)', animation: 'breathe 5s ease-in-out infinite', marginBottom: 8 }}>
          <Paw size={68} fill="#fff" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 60, letterSpacing: '-.02em', margin: '18px 0 0', color: 'var(--ink)' }}>momo</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 19, fontWeight: 600, color: 'var(--ink-soft)', maxWidth: 380, margin: '12px 0 0', lineHeight: 1.5 }}>
          A cozy little home for everything that makes your pet, <span className="hl" style={{ fontWeight: 800, color: 'var(--accent-ink)' }}>your pet.</span>
        </p>

        <div style={{ display: 'flex', gap: 10, margin: '18px 0 30px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: 'heart', label: 'Health records' },
            { icon: 'bell', label: 'Care reminders' },
            { icon: 'spark', label: 'AI Rx scans' },
          ].map((c) => (
            <span key={c.label} className="tagchip" style={{ background: 'var(--card)', boxShadow: 'var(--shadow-sm)', color: 'var(--ink-soft)', paddingLeft: 13, paddingRight: 13 }}>
              <Icon name={c.icon as 'heart'} size={16} /> {c.label}
            </span>
          ))}
        </div>

        <button className="btn" onClick={onLogin} disabled={loading} style={{ padding: '14px 26px', fontSize: 16, background: 'var(--card)', boxShadow: 'var(--shadow)', borderColor: 'var(--line)' }}>
          {loading ? <span className="spin dark" /> : <GoogleG />}
          Continue with Google
        </button>
        {error && <p style={{ color: 'var(--danger)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, marginTop: 14 }}>{error}</p>}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-faint)', marginTop: 20, maxWidth: 300, lineHeight: 1.5 }}>
          Your pet's data lives in <b>your own</b> Google Drive. Private by default.
        </p>
      </div>
    </div>
  )
}
