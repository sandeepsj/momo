// The fixed decorative layer behind every screen: two drifting accent blobs, a
// faint dot grid, and a couple of oversized translucent paws.
import { Paw } from '@/components/icons'

export default function Backdrop() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -140, left: -120, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle,var(--accent),transparent 70%)', opacity: 0.28, filter: 'blur(44px)', animation: 'floaty 22s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: -160, right: -120, width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,var(--accent-2),transparent 70%)', opacity: 0.22, filter: 'blur(50px)', animation: 'floaty2 26s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px,var(--dot) 1px,transparent 0)', backgroundSize: '26px 26px' }} />
      <Paw size={64} fill="var(--accent)" style={{ position: 'absolute', top: '12%', right: '7%', opacity: 0.06, transform: 'rotate(20deg)' }} />
      <Paw size={52} fill="var(--accent-2)" style={{ position: 'absolute', bottom: '16%', left: '6%', opacity: 0.07, transform: 'rotate(-24deg)' }} />
    </div>
  )
}
