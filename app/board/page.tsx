import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase'
import { FeatureBoard } from '@/components/FeatureBoard'
import type { FeatureRequest } from '@/lib/types'

export const metadata: Metadata = { title: 'Board' }

export default async function BoardPage() {
  let requests: FeatureRequest[] = []
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('feature_requests')
      .select('*')
      .neq('status', 'rejected')
      .order('vote_count', { ascending: false })
      .order('created_at', { ascending: false })
    requests = (data as FeatureRequest[]) ?? []
  } catch {
    // Supabase not yet configured — board renders empty
  }

  return (
    <div className="pt-8">
      <div className="max-w-3xl mx-auto px-6 mb-6">
        <h1 className="font-display text-4xl tracking-wide text-foreground">
          THE BOARD
        </h1>
        <p className="font-mono text-xs text-muted mt-1">
          Vote for what you want built. Top ideas ship weekly.
        </p>
      </div>

      <FeatureBoard initialRequests={requests} />
    </div>
  )
}
