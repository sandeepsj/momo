// Small date/format helpers. All dates are stored as ISO strings.

export function fmtDate(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function fmtDateShort(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

/** ISO date (yyyy-mm-dd) for <input type=date> values. */
export function toDateInput(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function fromDateInput(value: string): string {
  if (!value) return ''
  const d = new Date(value + 'T00:00:00')
  return isNaN(d.getTime()) ? '' : d.toISOString()
}

export function daysUntil(iso: string | undefined): number | null {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000)
}

/** "in 3 days", "today", "2 days ago". */
export function relativeDue(iso: string | undefined): string {
  const n = daysUntil(iso)
  if (n === null) return ''
  if (n === 0) return 'today'
  if (n === 1) return 'tomorrow'
  if (n === -1) return 'yesterday'
  if (n > 1) return `in ${n} days`
  return `${Math.abs(n)} days ago`
}

export function ageFrom(iso: string | undefined): string {
  if (!iso) return ''
  const b = new Date(iso)
  if (isNaN(b.getTime())) return ''
  const now = new Date()
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth())
  if (now.getDate() < b.getDate()) months -= 1
  if (months < 0) return ''
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (years === 0) return `${rem} month${rem === 1 ? '' : 's'} old`
  if (rem === 0) return `${years} year${years === 1 ? '' : 's'} old`
  return `${years}y ${rem}m old`
}

export function uid(): string {
  return crypto.randomUUID()
}

/** CSS colour var for a due date by urgency: overdue → danger, ≤7d → warn. */
export function dueColor(iso: string | undefined): string {
  const n = daysUntil(iso)
  if (n === null) return 'var(--ink-faint)'
  if (n < 0) return 'var(--danger)'
  if (n <= 7) return 'var(--warn)'
  return 'var(--ink-faint)'
}
