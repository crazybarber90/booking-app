import type { NextConfig } from 'next'

// Pravi origin API-ja (server-side; ne ide u browser bundle).
const API_ORIGIN =
  process.env.BOOKING_API_ORIGIN ?? 'https://test-booking-api.bid.workers.dev'

const nextConfig: NextConfig = {
  // Slike soba dolaze sa picsum.photos (mock iz API-ja) — dozvoli next/image.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }],
  },

  /**
   * Proxy za API — rešava CORS.
   * Browser zove naš isti-origin `/api/*`, Next ga server-side preusmeri na
   * pravi API. Server→server nema CORS, pa browser nikad ne vidi cross-origin.
   */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_ORIGIN}/:path*`,
      },
    ]
  },
}

export default nextConfig

//   ▎ Moj Next app radi na localhost:3000, API je na drugom
//   ▎ originu. Pošto API ne vraća Access-Control-Allow-Origin,
//   ▎ direktan poziv iz browsera CORS blokira — kod GET-a
//   ▎ dobijem 200 ali mi browser sakrije response, kod POST-a
//   ▎ padne već na preflight-u. Rešenje: axios zovem na
//   ▎ relativni /api/..., pa za browser je to isti origin i nema
//   ▎ CORS provere. Taj /api/* Next server presretne kroz
//   ▎ rewrites() i prosledi pravom API-ju — a server→server
//   ▎ poziv nema CORS. Browser misli da priča sam sa sobom, a
//   ▎ preusmeravanje radi server iza scene.“
