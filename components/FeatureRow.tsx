'use client'

import Link from 'next/link'
import type { FeatureRequest } from '@/lib/types'
import { VoteButton } from './VoteButton'
import { StatusBadge } from './StatusBadge'

interface Props {
  request: FeatureRequest
  onVote: (id: string, newCount: number) => void
}

export function FeatureRow({ request, onVote }: Props) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border hover:border-border-hover transition-colors group">
      <VoteButton
        requestId={request.id}
        count={request.vote_count}
        onVote={onVote}
      />

      <Link href={`/request/${request.id}`} className="flex-1 min-w-0">
        <span className="font-sans text-sm text-foreground group-hover:text-accent transition-colors line-clamp-1">
          {request.title}
        </span>
      </Link>

      <StatusBadge status={request.status} />

      <Link
        href={`/request/${request.id}`}
        className="text-muted group-hover:text-accent transition-colors text-sm font-mono shrink-0"
        aria-label="View request"
      >
        →
      </Link>
    </div>
  )
}
