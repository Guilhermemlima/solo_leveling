import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ascend System',
    short_name: 'Ascend',
    description: 'RPG dark fantasy de evolução pessoal: missões reais viram poder.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#050816',
    theme_color: '#7b2fbe',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  }
}
