'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFingerprint } from '@/lib/fingerprint'

interface Comment {
  id: string
  body: string
  created_at: string
}

export function CommentThread({ requestId }: { requestId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading]   = useState(true)
  const [body, setBody]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    fetch(`/api/comments?request_id=${requestId}`)
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [requestId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (body.trim().length < 2) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          body: body.trim(),
          author_fingerprint: getFingerprint(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Something went wrong.')
        return
      }

      const comment: Comment = await res.json()
      setComments((prev) => [...prev, comment])
      setBody('')
    } catch {
      setError('Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h2 className="font-mono text-xs text-muted uppercase tracking-widest mb-6">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {/* Comment list */}
      {loading ? (
        <div className="font-mono text-xs text-muted py-4">Loading...</div>
      ) : (
        <div className="space-y-6 mb-8">
          <AnimatePresence>
            {comments.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-1 bg-border shrink-0 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-foreground leading-6">{c.body}</p>
                  <span className="font-mono text-xs text-muted/60 mt-1 block">
                    {timeAgo(c.created_at)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {comments.length === 0 && (
            <p className="font-mono text-xs text-muted">
              No comments yet. Be the first.
            </p>
          )}
        </div>
      )}

      {/* Submit form */}
      <form onSubmit={handleSubmit} className="flex gap-3 items-start">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          maxLength={500}
          className="flex-1 bg-surface border border-border focus:border-accent px-3 py-2 font-sans text-sm text-foreground placeholder:text-muted/40 resize-none outline-none transition-colors"
        />
        <motion.button
          type="submit"
          disabled={submitting || body.trim().length < 2}
          whileTap={{ scale: 0.95 }}
          className="shrink-0 px-4 py-2 border border-border hover:border-accent text-muted hover:text-accent font-mono text-xs disabled:opacity-30 transition-colors"
        >
          {submitting ? '...' : 'Post'}
        </motion.button>
      </form>
      {error && <p className="font-mono text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}
