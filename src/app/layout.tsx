import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PwaRegister } from '@/components/PwaRegister'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ascend System — Desperte seu poder',
  description: 'RPG de evolução pessoal dark fantasy. Cumpra missões reais, ganhe EXP, evolua atributos, suba de rank e enfrente as sombras.',
  icons: { icon: '/logo.png', apple: '/logo.png' },
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
