'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href

    if (navigator.share) {
      await navigator.share({ title: `Forged: ${title}`, url }).catch(() => {})
      return
    }

    await navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.button
      onClick={handleShare}
      whileTap={{ scale: 0.95 }}
      className="font-mono text-xs text-muted hover:text-accent transition-colors"
    >
      {copied ? '✓ Copied' : 'Share →'}
    </motion.button>
  )
}
