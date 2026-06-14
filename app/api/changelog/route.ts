import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('changelog_entries')
    .select('*')
    .order('deployed_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const adminSecret = request.headers.get('x-admin-secret')
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.title) {
    return NextResponse.json({ error: 'Title required' }, { status: 422 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('changelog_entries')
    .insert({
      title: body.title.trim(),
      description: body.description?.trim() ?? null,
      github_pr_url: body.github_pr_url?.trim() ?? null,
      feature_request_id: body.feature_request_id ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
