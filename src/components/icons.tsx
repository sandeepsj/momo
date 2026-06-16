// Inline-SVG icon set, ported verbatim from the design handoff. All icons are
// 24×24, stroke=currentColor, 2px round outline (a few are sized/weighted per use).

import type { CSSProperties, ReactElement } from 'react'
import type { EventType, ReminderKind } from '@/types'

export const ICON_PATHS: Record<string, string[]> = {
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18', 'M12 7.6v4.6l3 1.9'],
  cal: ['M6 4.5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2z', 'M4 9.5h16', 'M8.5 2.5v4', 'M15.5 2.5v4'],
  book: ['M12 6.2C10.3 5.1 7.9 4.5 5.5 4.5 4 4.5 3 5 3 5v13s1-.5 2.5-.5 4.8.6 6.5 1.7c1.7-1.1 4-1.7 6.5-1.7 1.5 0 2.5.5 2.5.5V5s-1-.5-2.5-.5c-2.4 0-4.8.6-6.5 1.7z', 'M12 6.2v13'],
  cross: ['M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18', 'M12 8v8', 'M8 12h8'],
  food: ['M3.5 11.5h17a8.5 8.5 0 0 1-17 0z', 'M2.5 11.5h19', 'M9 8.5c0-1.5 1-2 1-3.6', 'M13 8.5c0-1.5 1-2 1-3.6'],
  bulb: ['M12 3a6 6 0 0 0-3.8 10.6c.6.5 1 1.1 1 2.1h5.6c0-1 .4-1.6 1-2.1A6 6 0 0 0 12 3z', 'M9.5 19h5', 'M10.5 21.5h3'],
  scale: ['M12 5v15', 'M6.5 20h11', 'M4 8.5h16', 'M4 8.5l-2 5a3 3 0 0 0 6 0l-2-5z', 'M20 8.5l-2 5a3 3 0 0 0 6 0l-2-5z'],
  heart: ['M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z', 'M5.6 11.6h2.6l1.3-2.4 2 4.4 1.2-2.2h4.7'],
  doc: ['M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z', 'M14 3.5v5h5', 'M9 13.5h6', 'M9 17h4'],
  cam: ['M4.5 7.5h2.8l1.7-2h6l1.7 2h2.8a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 17v-9a1.5 1.5 0 0 1 1.5-1.5z', 'M12 16.4a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6z'],
  spark: ['M12 3l1.7 5.1c.2.6.6 1 1.2 1.2L20 11l-5.1 1.7c-.6.2-1 .6-1.2 1.2L12 19l-1.7-5.1c-.2-.6-.6-1-1.2-1.2L4 11l5.1-1.7c.6-.2 1-.6 1.2-1.2z'],
  cake: ['M5 20.5h14', 'M5.5 20.5v-7h13v7', 'M4 13.5c0-1.2 1-2 2-2s2 .8 2 2 1-2 2-2 2 .8 2 2 1-2 2-2 2 .8 2 2', 'M12 11.5v-3'],
  home: ['M4 11.5 12 4l8 7.5', 'M6 10.4V20h12v-9.6'],
  warn: ['M12 4.5 21 20H3z', 'M12 10v4', 'M12 17h.01'],
  check: ['M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18', 'M8 12.2l2.6 2.6L16 9.4'],
  tick: ['M5 12.5l4 4L19 7'],
  bell: ['M6 16.5V11a6 6 0 0 1 12 0v5.5l1.6 2H4.4z', 'M10 20a2 2 0 0 0 4 0'],
  syringe: ['M16 3l5 5', 'M18.5 5.5l-10 10', 'M8.5 15.5l-3.5 1 1-3.5 8.6-8.6', 'M11 13l1.6 1.6', 'M13.6 10.4l1.6 1.6'],
  worm: ['M3 14c2.2 0 2.2-3.6 4.4-3.6S9.6 14 11.8 14s2.2-3.6 4.4-3.6S18.4 14 20.6 14'],
  bug: ['M12 8.5a4.5 4.5 0 0 1 4.5 4.5v1a4.5 4.5 0 0 1-9 0v-1A4.5 4.5 0 0 1 12 8.5z', 'M9.5 9.2 8 7M14.5 9.2 16 7', 'M7.5 13H4M20 13h-3.5', 'M8 17l-2.2 2M16 17l2.2 2'],
  scissors: ['M6.8 4.6a2.2 2.2 0 1 0 .01 0', 'M6.8 15.2a2.2 2.2 0 1 0 .01 0', 'M8.9 8.7 20 17M8.9 15.3 20 7'],
  smile: ['M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18', 'M8.5 14.2s1.3 1.6 3.5 1.6 3.5-1.6 3.5-1.6', 'M9 9.5h.01M15 9.5h.01'],
  compass: ['M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18', 'M15.5 8.5l-2 5-5 2 2-5z'],
  pin: ['M12 21s6-5.3 6-10a6 6 0 0 0-12 0c0 4.7 6 10 6 10z', 'M12 11a2 2 0 1 0 0-.01'],
  phone: ['M5 4h3l1.6 4-2 1.4a11 11 0 0 0 5 5l1.4-2 4 1.6V19a2 2 0 0 1-2.2 2A15 15 0 0 1 4 6.2 2 2 0 0 1 5 4z'],
  leaf: ['M5 19c10 1 14-4 14-13C9 6 4 10 5 19z', 'M5 19c2.5-5 5-7 9-9'],
  pill: ['M6.5 8.5h11a3.5 3.5 0 0 1 0 7h-11a3.5 3.5 0 0 1 0-7z', 'M12 8.5v7'],
  clip: ['M16 6.5 8.5 14a2.5 2.5 0 0 0 3.5 3.5l7-7a4.5 4.5 0 0 0-6.4-6.4l-7.6 7.6a6.5 6.5 0 0 0 9.2 9.2l5.3-5.3'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5'],
  refresh: ['M3.5 12a8.5 8.5 0 0 1 14.5-6M20.5 12A8.5 8.5 0 0 1 6 18', 'M18 3.5V8h-4.5M6 20.5V16h4.5'],
}

export type IconName = keyof typeof ICON_PATHS

export function Icon({
  name,
  size = 20,
  sw = 2,
  style,
}: {
  name: IconName
  size?: number
  sw?: number
  style?: CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: size, height: size, display: 'block', flex: '0 0 auto', ...style }}
    >
      {ICON_PATHS[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

/** Filled paw — used as the brand mark and scattered decorations. */
export function Paw({ size = 24, fill = 'currentColor', style }: { size?: number; fill?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill={fill} style={{ width: size, height: size, ...style }}>
      <ellipse cx="6.3" cy="10.2" rx="2.1" ry="2.7" />
      <ellipse cx="10.8" cy="7.4" rx="2.2" ry="2.9" />
      <ellipse cx="15.6" cy="8.6" rx="2.1" ry="2.7" />
      <ellipse cx="19.2" cy="12" rx="1.7" ry="2.2" />
      <path d="M12.4 12.2c-3 0-5.4 2.1-5.4 4.6 0 2 1.8 3 5.4 3s5.4-1 5.4-3c0-2.5-2.4-4.6-5.4-4.6z" />
    </svg>
  )
}

export function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.2-4.9 3.2-7.9z" />
      <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M6 14.4a6.6 6.6 0 0 1 0-4.2V7.4H2.3a11 11 0 0 0 0 9.8L6 14.4z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1A11 11 0 0 0 2.3 7.4L6 10.2C6.9 7.7 9.2 5.4 12 5.4z" />
    </svg>
  )
}

export function ThemeGlyph({ dark }: { dark: boolean }) {
  if (dark) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19 }}>
        <circle cx="12" cy="12" r="4" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => {
          const r = (a * Math.PI) / 180
          return <line key={i} x1={12 + 7.4 * Math.cos(r)} y1={12 + 7.4 * Math.sin(r)} x2={12 + 9.6 * Math.cos(r)} y2={12 + 9.6 * Math.sin(r)} />
        })}
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19 }}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

// ---- dock glyphs (bespoke, match the prototype exactly) ----
const dockProps = { viewBox: '0 0 24 24', fill: 'none' as const, stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
export const DOCK_GLYPHS: Record<string, ReactElement> = {
  home: <svg {...dockProps} strokeWidth={2.1}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10.4V20h12v-9.6" /></svg>,
  profile: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="6.4" cy="10.4" rx="1.9" ry="2.5" />
      <ellipse cx="10.6" cy="7.7" rx="2" ry="2.7" />
      <ellipse cx="15" cy="8.7" rx="1.9" ry="2.5" />
      <path d="M11.6 12.4c-2.7 0-4.8 1.9-4.8 4.1 0 1.8 1.6 2.7 4.8 2.7s4.8-.9 4.8-2.7c0-2.2-2.1-4.1-4.8-4.1z" />
    </svg>
  ),
  medical: <svg {...dockProps}><path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" /><path d="M5.6 11.6h2.6l1.3-2.4 2 4.4 1.2-2.2h4.7" /></svg>,
  rx: <svg {...dockProps}><rect x="3" y="8.5" width="18" height="7" rx="3.5" /><path d="M12 8.5v7" /></svg>,
  care: <svg {...dockProps}><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.6 2H4.4z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>,
}

// ---- mappings ----
export function eventIconName(type: EventType): IconName {
  const m: Record<EventType, IconName> = {
    milestone: 'spark', vet: 'cross', grooming: 'scissors', adventure: 'compass',
    funny: 'smile', firsts: 'spark', other: 'pin',
  }
  return m[type] ?? 'pin'
}

export interface KindMeta { label: string; color: string; icon: IconName }
export function kindMeta(kind: ReminderKind): KindMeta {
  const m: Record<ReminderKind, KindMeta> = {
    vaccination: { label: 'Vaccine', color: '#6C8CFF', icon: 'syringe' },
    deworming: { label: 'Deworm', color: '#5FA777', icon: 'worm' },
    'tick-flea': { label: 'Tick & flea', color: '#E0A458', icon: 'bug' },
    grooming: { label: 'Grooming', color: '#C58CFF', icon: 'scissors' },
    'vet-checkup': { label: 'Check-up', color: '#4BB3C4', icon: 'cross' },
    custom: { label: 'Custom', color: 'var(--accent)', icon: 'bell' },
  }
  return m[kind] ?? m.custom
}
