'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { FeatureRequest, FeatureStatus } from '@/lib/types'
import { FeatureRow } from './FeatureRow'
import { SubmitModal } from './SubmitModal'

type Filter = 'all' | FeatureStatus

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'building',  label: 'Building' },
  { key: 'shipped',   label: 'Shipped' },
]

function WeeklyBanner({ candidates, onVote }: { candidates: FeatureRequest[]; onVote: (id: string, n: number) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-0 border border-accent/30 bg-accent/5 px-6 py-5"
    >
      <div className="flex items-baseline justify-between mb-4">
        <span className="font-display text-xl tracking-widest text-accent">
          THIS WEEK&apos;S CANDIDATES
        </span>
        <span className="font-mono text-xs text-muted">voting closes Sunday</span>
      </div>
      <div>
        {candidates.map((req, i) => (
          <div key={req.id} className="flex items-center gap-4 py-3 border-b border-accent/10 last:border-0">
            <span className="font-mono text-xs text-accent/50 w-4 shrink-0">#{i + 1}</span>
            <FeatureRow request={req} onVote={onVote} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function FeatureBoard({ initialRequests }: { initialRequests: FeatureRequest[] }) {
  const [requests, setRequests] = useState<FeatureRequest[]>(initialRequests)
  const [filter, setFilter]     = useState<Filter>('all')
  const [showSubmit, setShowSubmit] = useState(false)

  const candidates = requests
    .filter((r) => r.status === 'candidate')
    .sort((a, b) => b.vote_count - a.vote_count)

  const filtered =
    filter === 'all'
      ? requests.filter((r) => r.status !== 'rejected')
      : requests.filter((r) => r.status === filter)

  function onVote(id: string, newCount: number) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, vote_count: newCount } : r))
    )
  }

  function onSubmitted(req: FeatureRequest) {
    setRequests((prev) => [req, ...prev])
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-6 pb-16">
      {/* Weekly candidates banner */}
      {candidates.length > 0 && (
        <WeeklyBanner candidates={candidates} onVote={onVote} />
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between py-6 border-b border-border">
        <div className="flex items-center gap-5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`font-mono text-xs transition-colors ${
                filter === f.key ? 'text-accent' : 'text-muted hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <motion.button
          onClick={() => setShowSubmit(true)}
          whileTap={{ scale: 0.95 }}
          className="font-mono text-xs text-muted hover:text-accent transition-colors border border-border hover:border-accent/50 px-3 py-1.5"
        >
          + Submit
        </motion.button>
      </div>

      {/* Rows */}
      <div className="stagger">
        {filtered.length === 0 ? (
          <div className="py-20 text-center font-mono text-xs text-muted">
            {filter === 'all' ? 'No ideas yet. Be the first.' : `No ${filter} ideas.`}
          </div>
        ) : (
          filtered.map((request) => (
            <FeatureRow key={request.id} request={request} onVote={onVote} />
          ))
        )}
      </div>

      {/* Submit modal */}
      <AnimatePresence>
        {showSubmit && (
          <SubmitModal
            onClose={() => setShowSubmit(false)}
            onSubmitted={onSubmitted}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
