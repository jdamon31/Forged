import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/Nav'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  title: { default: 'Forged', template: '%s — Forged' },
  description: 'Built by the internet. Submit ideas, vote for what you want, watch Claude build it.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Forged',
  },
  openGraph: {
    title: 'Forged',
    description: 'Built by the internet.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#090909',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Nav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
