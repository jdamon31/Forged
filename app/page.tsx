import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let ideas = 0, nShipped = 0, nFixed = 0

  try {
    const supabase = createClient()
    const [{ count: a }, { count: b }, { count: c }] = await Promise.all([
      supabase.from('feature_requests').select('*', { count: 'exact', head: true }),
      supabase.from('feature_requests').select('*', { count: 'exact', head: true }).eq('status', 'shipped'),
      supabase.from('bug_reports').select('*', { count: 'exact', head: true }).eq('status', 'fixed'),
    ])
    ideas    = a ?? 0
    nShipped = b ?? 0
    nFixed   = c ?? 0
  } catch {
    // Supabase not yet configured — stats show as 0
  }

  return (
    <div className="max-w-3xl mx-auto px-6 w-full">
      {/* Hero */}
      <section className="min-h-[80vh] flex flex-col justify-center">
        <div className="stagger">
          <h1 className="font-display text-[clamp(72px,14vw,180px)] leading-none tracking-wide text-foreground">
            FORGED
          </h1>

          <p className="font-sans text-lg md:text-xl text-muted mt-4 mb-10">
            Built by the internet.
          </p>

          <div className="flex items-center gap-6 flex-wrap">
            <Link
              href="/board"
              className="inline-flex items-center gap-2 px-5 py-3 border border-border hover:border-accent/60 font-mono text-sm text-foreground hover:text-accent transition-colors"
            >
              View the board <span className="text-accent">→</span>
            </Link>

            {ideas > 0 && (
              <span className="font-mono text-xs text-muted">
                {ideas} {ideas === 1 ? 'idea' : 'ideas'} submitted
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Concept */}
      <section className="py-20">
        <div className="space-y-3 text-muted font-sans text-base md:text-lg animate-fade-up">
          <p>Submit an idea. Vote for what you want.</p>
          <p>Top ideas get selected each week.</p>
          <p>Claude builds the winner. You shape what this becomes.</p>
        </div>
      </section>

      {/* Stats — only show non-zero values */}
      {(() => {
        const stats = [
          { value: ideas,    label: 'ideas submitted' },
          { value: nShipped, label: 'features shipped' },
          { value: nFixed,   label: 'bugs fixed' },
        ].filter((s) => s.value > 0)
        if (!stats.length) return null
        return (
          <>
            <div className="border-t border-border" />
            <section className="py-16">
              <div className="flex gap-12 flex-wrap animate-fade-in">
                {stats.map(({ value, label }) => (
                  <div key={label}>
                    <div className="font-display text-[clamp(36px,6vw,72px)] leading-none text-accent">
                      {value}
                    </div>
                    <div className="font-mono text-xs text-muted mt-2">{label}</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )
      })()}
    </div>
  )
}
