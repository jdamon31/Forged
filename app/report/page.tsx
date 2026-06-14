'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import { motion } from 'framer-motion'

// Note: metadata export is ignored in 'use client' files.
// Title is set in layout template via the route segment.

export default function ReportPage() {
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
    } catch {
      setError('Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center animate-fade-up">
        <div className="font-display text-6xl text-accent mb-4">FILED</div>
        <p className="font-mono text-sm text-muted mb-2">Bug filed. Claude&apos;s on it.</p>
        <p className="font-mono text-xs text-muted/60">
          A fix will be reviewed and shipped if confirmed.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 animate-fade-up">
      <div className="mb-10">
        <h1 className="font-display text-4xl tracking-wide text-foreground">
          REPORT A BUG
        </h1>
        <p className="font-mono text-xs text-muted mt-1">
          Found something broken? File it and Claude will generate a fix.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
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
            className="w-full bg-surface border border-border focus:border-accent px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted/40 transition-colors outline-none"
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-muted mb-2 uppercase tracking-widest">
            Details (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What did you expect to happen vs. what actually happened?"
            rows={3}
            maxLength={500}
            className="w-full bg-surface border border-border focus:border-accent px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted/40 resize-none transition-colors outline-none"
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-muted mb-2 uppercase tracking-widest">
            Steps to reproduce (optional)
          </label>
          <textarea
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder={'1. Go to /board\n2. Tap the vote button\n3. Nothing happens'}
            rows={4}
            maxLength={500}
            className="w-full bg-surface border border-border focus:border-accent px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted/40 resize-none transition-colors outline-none"
          />
        </div>

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}

        <motion.button
          type="submit"
          disabled={submitting || title.trim().length < 5}
          whileTap={{ scale: 0.97 }}
          className="px-6 py-3 bg-accent text-background font-mono text-sm hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Filing...' : 'File bug →'}
        </motion.button>
      </form>
    </div>
  )
}
