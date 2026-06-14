'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getFingerprint } from '@/lib/fingerprint'

interface Props {
  requestId: string
  count: number
  onVote: (id: string, newCount: number) => void
}

export function VoteButton({ requestId, count, onVote }: Props) {
  const [voting, setVoting] = useState(false)
  const [voted, setVoted] = useState(false)
  const [displayCount, setDisplayCount] = useState(count)

  useEffect(() => {
    const key = `voted_${requestId}`
    setVoted(localStorage.getItem(key) === '1')
  }, [requestId])

  useEffect(() => {
    setDisplayCount(count)
  }, [count])

  async function handleVote() {
    if (voting || voted) return
    setVoting(true)

    const fp = getFingerprint()

    try {
      const res = await fetch(`/api/feature-requests/${requestId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: fp }),
      })

      if (res.ok) {
        const { vote_count } = await res.json()
        setDisplayCount(vote_count)
        setVoted(true)
        localStorage.setItem(`voted_${requestId}`, '1')
        onVote(requestId, vote_count)
      } else if (res.status === 409) {
        setVoted(true)
        localStorage.setItem(`voted_${requestId}`, '1')
      }
    } finally {
      setVoting(false)
    }
  }

  return (
    <motion.button
      onClick={handleVote}
      whileTap={!voted ? { scale: 0.88 } : {}}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      disabled={voting}
      title={voted ? 'Already voted' : 'Vote for this'}
      className={`
        flex items-center justify-center w-14 h-9 shrink-0
        font-mono text-sm tabular-nums border transition-all duration-100
        ${voted
          ? 'border-accent text-accent bg-accent/5 cursor-default'
          : 'border-border text-muted hover:border-accent/60 hover:text-accent cursor-pointer'
        }
        ${voting ? 'opacity-50' : ''}
      `}
    >
      <motion.span
        key={displayCount}
        initial={{ y: -6, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        transition={{ duration: 0.12 }}
      >
        {String(displayCount).padStart(3, '0')}
      </motion.span>
    </motion.button>
  )
}
