'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/board',     label: 'Board',     short: 'Board' },
  { href: '/changelog', label: 'Changelog', short: 'Log' },
  { href: '/report',    label: 'Report bug', short: 'Report' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-30">
      <div className="max-w-3xl mx-auto px-6 flex items-center justify-between h-14">
        <Link
          href="/"
          className="font-display text-2xl tracking-widest text-foreground hover:text-accent transition-colors"
        >
          FORGED
        </Link>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono text-xs transition-colors ${
                pathname === link.href
                  ? 'text-accent'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <span className="hidden sm:inline">{link.label}</span>
            <span className="sm:hidden">{link.short}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
