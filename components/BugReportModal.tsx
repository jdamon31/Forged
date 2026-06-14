'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onClose: () => void
}

export function BugReportModal({ onClose }: Props) {
  const [title, setTitle]         = useState('')
  const [description, setDesc]    = useState('')
  const [steps, setSteps]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (title.trim().length < 5) {
      setError('Please describe the bug in at least 5 characters.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          steps_to_reproduce: steps.trim() || null,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Something went wrong.')
        return
      }

      setDone(true)
      setTimeout(onClose, 1400)
    } catch {
      setError('Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-full sm:max-w-md bg-surface border border-border p-6"
        >
          {done ? (
            <div className="py-8 text-center">
              <div className="font-display text-4xl text-accent mb-2">FILED</div>
              <p className="font-mono text-xs text-muted">Claude&apos;s on it.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs text-muted uppercase tracking-widest">
                  Report a bug
                </span>
                <button
                  onClick={onClose}
                  className="font-mono text-muted hover:text-foreground transition-colors text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs text-muted mb-2 uppercase tracking-widest">
                    What&apos;s broken? <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Vote button doesn't work on mobile"
                    maxLength={120}
                    className="w-full bg-background border border-border focus:border-accent px-3 py-2.5 font-sans text-sm text-foreground placeholder:text-muted/40 transition-colors outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-muted mb-2 uppercase tracking-widest">
                    Details (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="What did you expect to happen?"
                    rows={2}
                    maxLength={500}
                    className="w-full bg-background border border-border focus:border-accent px-3 py-2.5 font-sans text-sm text-foreground placeholder:text-muted/40 resize-none transition-colors outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-muted mb-2 uppercase tracking-widest">
                    Steps to reproduce (optional)
                  </label>
                  <textarea
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    placeholder="1. Go to /board&#10;2. Tap vote&#10;3. Nothing happens"
                    rows={3}
                    maxLength={500}
                    className="w-full bg-background border border-border focus:border-accent px-3 py-2.5 font-sans text-sm text-foreground placeholder:text-muted/40 resize-none transition-colors outline-none"
                  />
                </div>

                {error && (
                  <p className="font-mono text-xs text-red-400">{error}</p>
                )}

                <motion.button
                  type="submit"
                  disabled={submitting || title.trim().length < 5}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 bg-accent text-background font-mono text-sm hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Filing bug...' : 'File bug →'}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </>
    </AnimatePresence>
  )
}
