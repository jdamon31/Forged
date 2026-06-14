import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

function checkAuth(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.id || !body?.status) {
    return NextResponse.json({ error: 'id and status required' }, { status: 422 })
  }

  const validStatuses = ['pending', 'building', 'shipped', 'rejected']
  if (!validStatuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 422 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('feature_requests')
    .update({ status: body.status })
    .eq('id', body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const id = body?.id
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 422 })

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('feature_requests')
    .update({ status: 'rejected' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
