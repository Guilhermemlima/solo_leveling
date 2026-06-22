import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compra confirmada — Ascend System',
  description: 'Seu pagamento foi recebido. Verifique seu e-mail para acessar o Ascend System.',
}

export default function ObrigadoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-5 py-12 bg-grid">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-5">
          <Image src="/logo.png" alt="Ascend System" width={72} height={72} className="rounded-2xl" priority />
        </div>

        <div className="glass neon-border rounded-2xl p-8">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Compra recebida!</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Obrigado pela sua compra. Assim que o pagamento for confirmado, você receberá um
            <strong className="text-slate-200"> e-mail com seus dados de acesso</strong> (login e senha temporária).
          </p>

          <ol className="text-left space-y-3 mb-6">
            <Step n={1} title="Verifique seu e-mail" desc="Procure a mensagem do Ascend System (cheque também o spam/promoções)." />
            <Step n={2} title="Use a senha temporária" desc="Entre com o e-mail e a senha enviada." />
            <Step n={3} title="Troque sua senha" desc="No primeiro acesso, altere a senha em Perfil → Segurança." />
          </ol>

          <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-3 text-amber-300/90 text-xs mb-6">
            O e-mail pode levar alguns minutos para chegar, pois depende da confirmação do pagamento.
          </div>

          <Link href="/login"
            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-colors">
            Acessar o Ascend System
          </Link>

          <p className="text-slate-500 text-xs mt-5">
            Não recebeu o e-mail? Fale com o suporte:{' '}
            <a href="mailto:guilhermemulinarelima@gmail.com" className="text-indigo-400 hover:text-indigo-300">
              guilhermemulinarelima@gmail.com
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-sm font-bold flex items-center justify-center">
        {n}
      </span>
      <div>
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </li>
  )
}
