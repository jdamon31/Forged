import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#090909',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 90px',
          position: 'relative',
        }}
      >
        {/* Orange top bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: '#F97316',
          }}
        />

        {/* Wordmark */}
        <div
          style={{
            fontSize: '160px',
            fontWeight: 900,
            color: '#fafafa',
            lineHeight: 1,
            letterSpacing: '8px',
            fontFamily: 'sans-serif',
            marginBottom: '32px',
          }}
        >
          FORGED
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '32px',
            color: '#71717a',
            fontFamily: 'monospace',
            letterSpacing: '1px',
          }}
        >
          Built by the internet.
        </div>

        {/* Bottom right accent */}
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '90px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#F97316',
            }}
          />
          <div
            style={{
              fontSize: '18px',
              color: '#333',
              fontFamily: 'monospace',
              letterSpacing: '2px',
            }}
          >
            forged-lake.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
