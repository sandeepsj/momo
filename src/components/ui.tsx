// Reusable presentational widgets: Modal, TagEditor, SaveBadge, Avatar.
import { useEffect, useState, type ReactNode } from 'react'
import type { SaveState } from '@/context/PetProvider'
import { useMediaUrl } from '@/hooks/useMediaUrl'

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="card modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

/** Editable list of string "chips" — used for likes, dislikes, brands, conditions. */
export function TagEditor({
  label,
  values,
  onChange,
  placeholder = 'Add…',
}: {
  label?: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setDraft('')
  }
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="row" style={{ gap: '0.4rem' }}>
        {values.map((v) => (
          <span className="chip" key={v}>
            {v}
            <button onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="row" style={{ marginTop: '0.3rem' }}>
        <input
          className="input"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          style={{ maxWidth: 220 }}
        />
        <button className="btn sm" onClick={add} type="button">
          Add
        </button>
      </div>
    </div>
  )
}

export function SaveBadge({ state }: { state: SaveState }) {
  if (state === 'saving') return <><span className="spin" /> Saving…</>
  if (state === 'saved') return <>✓ Saved to Drive</>
  if (state === 'error') return <span className="due-over">⚠ Save failed</span>
  return <>All changes saved</>
}

/** Avatar that loads a Drive image by file id, falling back to an emoji. */
export function Avatar({
  fileId,
  emoji,
  className,
}: {
  fileId?: string
  emoji: string
  className?: string
}) {
  const url = useMediaUrl(fileId)
  if (url) return <img className={className} src={url} alt="" />
  return <div className={className}>{emoji}</div>
}
