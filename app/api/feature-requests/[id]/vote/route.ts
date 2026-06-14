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

  // Fetch current count, increment, write back
  const { data: current } = await supabase
    .from('feature_requests')
    .select('vote_count')
    .eq('id', id)
    .single()

  const newCount = (current?.vote_count ?? 0) + 1

  await supabase
    .from('feature_requests')
    .update({ vote_count: newCount })
    .eq('id', id)

  return NextResponse.json({ vote_count: newCount })
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  const fingerprint = body?.fingerprint

  if (!fingerprint || typeof fingerprint !== 'string') {
    return NextResponse.json({ error: 'Missing fingerprint' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { error: deleteError } = await supabase
    .from('votes')
    .delete()
    .eq('request_id', id)
    .eq('voter_fingerprint', fingerprint)

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 })
  }

  const { data: current } = await supabase
    .from('feature_requests')
    .select('vote_count')
    .eq('id', id)
    .single()

  const newCount = Math.max(0, (current?.vote_count ?? 1) - 1)

  await supabase
    .from('feature_requests')
    .update({ vote_count: newCount })
    .eq('id', id)

  return NextResponse.json({ vote_count: newCount })
}
