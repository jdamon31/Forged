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

  // Count total votes and sync the denormalized column atomically via RPC
  const { data, error: rpcError } = await supabase.rpc('sync_vote_count', {
    p_request_id: id,
  })

  if (rpcError) {
    // Fallback: count manually
    const { count } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', id)
    return NextResponse.json({ vote_count: count ?? 0 })
  }

  return NextResponse.json({ vote_count: data })
}
