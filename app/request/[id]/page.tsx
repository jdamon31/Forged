import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/StatusBadge'
import { ShareButton } from '@/components/ShareButton'
import { CommentThread } from '@/components/CommentThread'
import type { FeatureRequest } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const supabase = createClient()
    const { data } = await supabase.from('feature_requests').select('title').eq('id', id).single()
    return { title: data?.title ?? 'Request' }
  } catch {
    return { title: 'Request' }
  }
}

export default async function RequestPage({ params }: Props) {
  const { id } = await params

  let request: FeatureRequest | null = null
  try {
    const supabase = createClient()
    const { data } = await supabase.from('feature_requests').select('*').eq('id', id).single()
    request = data as FeatureRequest | null
  } catch {
    // Supabase not configured or request not found
  }

  if (!request) notFound()

  const date = new Date(request.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 animate-fade-up">
      <div className="mb-8">
        <Link
          href="/board"
          className="font-mono text-xs text-muted hover:text-accent transition-colors"
        >
          ← Board
        </Link>
      </div>

      <div className="flex items-start justify-between gap-6">
        <h1 className="font-sans text-xl font-medium text-foreground flex-1 min-w-0">
          {request.title}
        </h1>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="font-mono text-3xl text-accent font-bold tabular-nums">
            {String(request.vote_count).padStart(3, '0')}
          </span>
          <span className="font-mono text-xs text-muted">votes</span>
          <StatusBadge status={request.status} />
        </div>
      </div>

      {request.description && (
        <p className="mt-6 font-sans text-sm text-muted leading-7">
          {request.description}
        </p>
      )}

      <div className="mt-10 pt-6 border-t border-border flex items-center gap-6 font-mono text-xs text-muted">
        <span>Submitted {date}</span>
        {request.github_pr_url && (
          <a
            href={request.github_pr_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            View PR →
          </a>
        )}
        <ShareButton title={request.title} />
      </div>

      <CommentThread requestId={request.id} />
    </div>
  )
}
