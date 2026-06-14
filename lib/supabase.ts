import { createClient as _createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export function createClient() {
  if (!url || !key) throw new Error('Supabase env vars not configured')
  return _createClient(url, key)
}
