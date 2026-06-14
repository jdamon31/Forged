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
    setVoted(localStorage.getItem(`voted_${requestId}`) === '1')
  }, [requestId])

  useEffect(() => {
    setDisplayCount(count)
  }, [count])

  async function handleVote() {
    if (voting) return
    setVoting(true)

    const fp = getFingerprint()
    const method = voted ? 'DELETE' : 'POST'

    try {
      const res = await fetch(`/api/feature-requests/${requestId}/vote`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: fp }),
      })

      if (res.ok) {
        const { vote_count } = await res.json()
        setDisplayCount(vote_count)
        onVote(requestId, vote_count)

        if (voted) {
          setVoted(false)
          localStorage.removeItem(`voted_${requestId}`)
        } else {
          setVoted(true)
          localStorage.setItem(`voted_${requestId}`, '1')
        }
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
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      disabled={voting}
      title={voted ? 'Click to unvote' : 'Vote for this'}
      className={`
        flex items-center justify-center w-14 h-9 shrink-0
        font-mono text-sm tabular-nums border transition-all duration-100 cursor-pointer
        ${voted
          ? 'border-accent text-accent bg-accent/5 hover:bg-transparent hover:text-muted'
          : 'border-border text-muted hover:border-accent/60 hover:text-accent'
        }
        ${voting ? 'opacity-50' : ''}
      `}
    >
      <motion.span
        key={displayCount}
        initial={{ y: -6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.12 }}
      >
        {String(displayCount).padStart(3, '0')}
      </motion.span>
    </motion.button>
  )
}
