import type { ChangelogEntry } from '@/lib/types'

export function ChangelogEntry({ entry }: { entry: ChangelogEntry }) {
  const date = new Date(entry.deployed_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="py-6 border-b border-border last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-sans text-foreground font-medium text-sm mb-1">
            {entry.title}
          </h3>
          {entry.description && (
            <p className="font-sans text-muted text-sm leading-6">
              {entry.description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="font-mono text-xs text-muted">{date}</span>
          {entry.github_pr_url && (
            <a
              href={entry.github_pr_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-accent hover:underline"
            >
              PR →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
