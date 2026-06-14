import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('feature_requests')
    .select('*')
    .order('vote_count', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { title, description, submitter_fingerprint } = body

  if (!title || typeof title !== 'string' || title.trim().length < 5) {
    return NextResponse.json({ error: 'Title must be at least 5 characters.' }, { status: 422 })
  }
  if (title.trim().length > 120) {
    return NextResponse.json({ error: 'Title too long.' }, { status: 422 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('feature_requests')
    .insert({
      title: title.trim(),
      description: description?.trim() ?? null,
      submitter_fingerprint: submitter_fingerprint ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
