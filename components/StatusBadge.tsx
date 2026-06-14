import type { FeatureStatus } from '@/lib/types'

const config: Record<FeatureStatus, { label: string; className: string }> = {
  pending:   { label: 'pending',      className: 'text-muted' },
  candidate: { label: '⚡ candidate', className: 'text-accent' },
  building:  { label: '🔨 building',  className: 'text-accent animate-pulse-slow' },
  shipped:   { label: '✓ shipped',    className: 'text-green-500' },
  rejected:  { label: 'rejected',     className: 'text-red-500/40' },
}

export function StatusBadge({ status }: { status: string }) {
  const c = config[status as FeatureStatus] ?? config.pending
  return (
    <span className={`font-mono text-xs whitespace-nowrap ${c.className}`}>
      {c.label}
    </span>
  )
}
