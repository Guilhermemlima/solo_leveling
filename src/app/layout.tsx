import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ascend System — Evolua sua vida',
  description: 'Transforme sua rotina em uma jornada de evolução pessoal. Missões, XP, níveis e recompensas para quem quer crescer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} min-h-full bg-[#050508] text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  )
}
