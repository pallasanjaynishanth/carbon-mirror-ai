import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CarbonMirror AI',
    short_name: 'CarbonMirror',
    description: 'See the hidden impact of your everyday choices.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0c0a09',
    theme_color: '#16a34a',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
