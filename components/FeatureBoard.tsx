'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { FeatureRequest, FeatureStatus } from '@/lib/types'
import { FeatureRow } from './FeatureRow'
import { SubmitModal } from './SubmitModal'

type Filter = 'all' | FeatureStatus

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'pending',  label: 'Pending' },
  { key: 'building', label: 'Building' },
  { key: 'shipped',  label: 'Shipped' },
]

export function FeatureBoard({ initialRequests }: { initialRequests: FeatureRequest[] }) {
  const [requests, setRequests] = useState<FeatureRequest[]>(initialRequests)
  const [filter, setFilter]     = useState<Filter>('all')
  const [showSubmit, setShowSubmit] = useState(false)

  const filtered =
    filter === 'all' ? requests : requests.filter((r) => r.status === filter)

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
      {/* Toolbar */}
      <div className="flex items-center justify-between py-6 border-b border-border">
        <div className="flex items-center gap-5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`font-mono text-xs transition-colors ${
                filter === f.key
                  ? 'text-accent'
                  : 'text-muted hover:text-foreground'
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
