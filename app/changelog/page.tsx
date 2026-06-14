import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase'
import { ChangelogEntry } from '@/components/ChangelogEntry'
import type { ChangelogEntry as ChangelogEntryType } from '@/lib/types'

export const metadata: Metadata = { title: 'Changelog' }

export default async function ChangelogPage() {
  let list: ChangelogEntryType[] = []
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('changelog_entries')
      .select('*')
      .order('deployed_at', { ascending: false })
    list = (data as ChangelogEntryType[]) ?? []
  } catch {
    // Supabase not yet configured
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl tracking-wide text-foreground">
          CHANGELOG
        </h1>
        <p className="font-mono text-xs text-muted mt-1">
          What&apos;s been built so far.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="py-20 text-center font-mono text-xs text-muted animate-fade-in">
          Nothing shipped yet — but it&apos;s coming.
        </div>
      ) : (
        <div className="stagger">
          {list.map((entry) => (
            <ChangelogEntry key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
