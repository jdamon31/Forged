import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

interface Context {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: Context) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  const fingerprint = body?.fingerprint

  if (!fingerprint || typeof fingerprint !== 'string') {
    return NextResponse.json({ error: 'Missing fingerprint' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Insert vote — unique constraint prevents duplicates
  const { error: voteError } = await supabase
    .from('votes')
    .insert({ request_id: id, voter_fingerprint: fingerprint })

  if (voteError) {
    if (voteError.code === '23505') {
      return NextResponse.json({ error: 'Already voted' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
  }

  // Atomically increment the existing vote_count (preserves seeded counts)
  const { data, error: rpcError } = await supabase.rpc('increment_vote_count', {
    p_request_id: id,
  })

  if (rpcError) {
    // Fallback: fetch current count and return it
    const { data: row } = await supabase
      .from('feature_requests')
      .select('vote_count')
      .eq('id', id)
      .single()
    return NextResponse.json({ vote_count: (row?.vote_count ?? 0) + 1 })
  }

  return NextResponse.json({ vote_count: data })
}
