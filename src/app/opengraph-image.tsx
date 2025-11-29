import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Higher Path Flower | Order Portal'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #f8f7f4 0%, #e8e6e1 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo Circle */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 24,
            background: '#2D5F3F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          {/* Leaf Icon */}
          <svg
            width="72"
            height="72"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: 16,
          }}
        >
          Higher Path
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: '#666666',
          }}
        >
          Premium Flower Delivery
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
