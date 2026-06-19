import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Chi Navy System',
    short_name: 'Chi Navy',
    description: 'RPG dark fantasy de evolução pessoal: missões reais viram poder.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#050816',
    theme_color: '#7b2fbe',
    orientation: 'portrait',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
