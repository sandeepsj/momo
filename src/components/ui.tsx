// Shared presentational widgets for the redesign.
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Icon, type IconName } from '@/components/icons'
import { useMediaUrl } from '@/hooks/useMediaUrl'

/** Centered modal with scrim + spring pop-in. */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(30,20,10,.42)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'pop .2s both' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 28, padding: 26, width: '100%', maxWidth: 440, boxShadow: '0 30px 70px -20px rgba(0,0,0,.5)', animation: 'pop .28s cubic-bezier(.2,.9,.3,1.3) both' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 23, margin: '0 0 18px' }}>{title}</h3>
        {children}
      </div>
    </div>
  )
}

export function ModalActions({ onCancel, onSave, saveLabel = 'Save', saveDisabled }: { onCancel: () => void; onSave: () => void; saveLabel?: string; saveDisabled?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
      <button className="btn ghost" onClick={onCancel}>Cancel</button>
      <button className="btn primary" onClick={onSave} disabled={saveDisabled}>{saveLabel}</button>
    </div>
  )
}

/** Tilted sticker icon + Fredoka heading + optional right-aligned action. */
export function StickerHeader({ icon, color, iconSize = 19, title, action, mb = 16 }: { icon: IconName; color?: string; iconSize?: number; title: string; action?: ReactNode; mb?: number }) {
  // When a section colour is given, use a same-hue gradient (matches the
  // prototype's per-section stickers); otherwise fall back to the accent class.
  const stkrStyle: CSSProperties | undefined = color
    ? { background: `linear-gradient(145deg, ${color}, color-mix(in srgb, ${color} 60%, #fff))`, boxShadow: `0 7px 14px -6px ${color}, inset 0 1px 0 rgba(255,255,255,.35)` }
    : undefined
  return (
    <div className="section-head" style={{ marginBottom: mb }}>
      <span className="stkr" style={stkrStyle}>
        <Icon name={icon} size={iconSize} />
      </span>
      <h3>{title}</h3>
      {action}
    </div>
  )
}

/** Chips with an inline "+ add" input (Enter to add; ✕ to remove). */
export function TagField({ values, onChange, chipStyle, placeholder = '+ add' }: { values: string[]; onChange: (next: string[]) => void; chipStyle?: CSSProperties; placeholder?: string }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setDraft('')
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
      {values.map((v) => (
        <span className="tagchip" key={v} style={chipStyle}>
          {v}
          <button onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}>✕</button>
        </span>
      ))}
      <input
        className="input"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        style={{ width: 96, padding: '6px 11px', fontSize: 13 }}
      />
    </div>
  )
}

/** Emoji tile that swaps to an uploaded Drive photo when present. */
export function Avatar({ fileId, emoji, fontSize, style }: { fileId?: string; emoji: string; fontSize?: number; style?: CSSProperties }) {
  const url = useMediaUrl(fileId)
  if (url) return <img src={url} alt="" style={{ objectFit: 'cover', ...style }} />
  return <div style={{ display: 'grid', placeItems: 'center', fontSize, ...style }}>{emoji}</div>
}
