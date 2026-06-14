'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { FeatureRequest, FeatureStatus } from '@/lib/types'

const STATUSES: FeatureStatus[] = ['pending', 'candidate', 'building', 'shipped', 'rejected']

export default function AdminPage() {
  const [secret, setSecret]         = useState('')
  const [authed, setAuthed]         = useState(false)
  const [requests, setRequests]     = useState<FeatureRequest[]>([])
  const [loading, setLoading]       = useState(false)
  const [authError, setAuthError]   = useState('')

  // Changelog form
  const [clTitle, setClTitle]       = useState('')
  const [clDesc, setClDesc]         = useState('')
  const [clPrUrl, setClPrUrl]       = useState('')
  const [clReqId, setClReqId]       = useState('')
  const [clSubmitting, setClSubmitting] = useState(false)
  const [clDone, setClDone]         = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_secret')
    if (saved) {
      setSecret(saved)
      loadRequests(saved)
    }
  }, [])

  async function loadRequests(s: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/feature-requests', {
        headers: { 'x-admin-secret': s },
      })
      if (res.status === 401) {
        setAuthError('Invalid password.')
        return
      }
      const data = await res.json()
      setRequests(data)
      setAuthed(true)
      sessionStorage.setItem('admin_secret', s)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    await loadRequests(secret)
  }

  async function updateStatus(id: string, status: FeatureStatus) {
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': secret,
      },
      body: JSON.stringify({ id, status }),
    })
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    )
  }

  async function submitChangelog(e: React.FormEvent) {
    e.preventDefault()
    if (!clTitle.trim()) return
    setClSubmitting(true)
    try {
      await fetch('/api/changelog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret,
        },
        body: JSON.stringify({
          title: clTitle.trim(),
          description: clDesc.trim() || null,
          github_pr_url: clPrUrl.trim() || null,
          feature_request_id: clReqId || null,
        }),
      })
      setClDone(true)
      setClTitle('')
      setClDesc('')
      setClPrUrl('')
      setClReqId('')
      setTimeout(() => setClDone(false), 2000)
    } finally {
      setClSubmitting(false)
    }
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-6 py-24 animate-fade-up">
        <h1 className="font-display text-3xl tracking-wide text-foreground mb-8">
          ADMIN
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Admin password"
            className="w-full bg-surface border border-border focus:border-accent px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted/40 outline-none transition-colors"
          />
          {authError && <p className="font-mono text-xs text-red-400">{authError}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent text-background font-mono text-sm hover:bg-accent/90 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Checking...' : 'Enter →'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 animate-fade-up">
      <h1 className="font-display text-4xl tracking-wide text-foreground mb-10">
        ADMIN
      </h1>

      {/* Feature Requests */}
      <section className="mb-16">
        <h2 className="font-mono text-xs text-muted uppercase tracking-widest mb-4">
          Feature Requests
        </h2>
        <div className="space-y-1">
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 py-3 border-b border-border"
            >
              <span className="font-mono text-xs text-accent w-10 tabular-nums shrink-0">
                {String(r.vote_count).padStart(3, '0')}
              </span>
              <span className="flex-1 font-sans text-sm text-foreground min-w-0 truncate">
                {r.title}
              </span>
              <select
                value={r.status}
                onChange={(e) => updateStatus(r.id, e.target.value as FeatureStatus)}
                className="bg-surface border border-border text-foreground font-mono text-xs px-2 py-1 outline-none focus:border-accent transition-colors cursor-pointer shrink-0"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* Add Changelog Entry */}
      <section>
        <h2 className="font-mono text-xs text-muted uppercase tracking-widest mb-4">
          Add Changelog Entry
        </h2>
        <form onSubmit={submitChangelog} className="space-y-4 max-w-lg">
          <input
            type="text"
            value={clTitle}
            onChange={(e) => setClTitle(e.target.value)}
            placeholder="What shipped?"
            className="w-full bg-surface border border-border focus:border-accent px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted/40 outline-none transition-colors"
          />
          <textarea
            value={clDesc}
            onChange={(e) => setClDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full bg-surface border border-border focus:border-accent px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted/40 resize-none outline-none transition-colors"
          />
          <input
            type="text"
            value={clPrUrl}
            onChange={(e) => setClPrUrl(e.target.value)}
            placeholder="GitHub PR URL (optional)"
            className="w-full bg-surface border border-border focus:border-accent px-4 py-3 font-mono text-xs text-foreground placeholder:text-muted/40 outline-none transition-colors"
          />
          <select
            value={clReqId}
            onChange={(e) => setClReqId(e.target.value)}
            className="w-full bg-surface border border-border focus:border-accent px-4 py-3 font-mono text-xs text-foreground outline-none transition-colors cursor-pointer"
          >
            <option value="">Link to feature request (optional)</option>
            {requests.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
          <motion.button
            type="submit"
            disabled={clSubmitting || !clTitle.trim()}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 bg-accent text-background font-mono text-sm hover:bg-accent/90 disabled:opacity-30 transition-colors"
          >
            {clDone ? '✓ Added' : clSubmitting ? 'Adding...' : 'Add entry →'}
          </motion.button>
        </form>
      </section>
    </div>
  )
}
