import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const requestId = request.nextUrl.searchParams.get('request_id')
  if (!requestId) return NextResponse.json({ error: 'request_id required' }, { status: 400 })

  const supabase = createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('id, body, created_at')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const { request_id, body: commentBody, author_fingerprint } = body ?? {}

  if (!request_id || !commentBody || typeof commentBody !== 'string') {
    return NextResponse.json({ error: 'request_id and body required' }, { status: 400 })
  }
  if (commentBody.trim().length < 2) {
    return NextResponse.json({ error: 'Comment too short.' }, { status: 422 })
  }
  if (commentBody.trim().length > 500) {
    return NextResponse.json({ error: 'Comment too long.' }, { status: 422 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('comments')
    .insert({
      request_id,
      body: commentBody.trim(),
      author_fingerprint: author_fingerprint ?? null,
    })
    .select('id, body, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
