import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PwaRegister } from '@/components/PwaRegister'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ascend System — Desperte seu poder',
  description: 'Transforme sua rotina em missões épicas com EXP, ranks e recompensas. RPG de evolução pessoal dark fantasy. Garantia de 7 dias.',
  icons: { icon: '/logo.png', apple: '/logo.png' },
  openGraph: {
    title: 'Ascend System — Desperte seu poder',
    description: 'Transforme sua rotina em missões épicas com EXP, ranks e recompensas. Garantia de 7 dias.',
    url: 'https://ascend-system-two.vercel.app',
    siteName: 'Ascend System',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ascend System — Desperte seu poder',
    description: 'Transforme sua rotina em missões épicas com EXP, ranks e recompensas.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} min-h-full bg-[#050816] text-slate-100 antialiased`}>
        <PwaRegister />
        {children}
      </body>
    </html>
  )
}
