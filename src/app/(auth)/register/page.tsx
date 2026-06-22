'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Mail, Lock, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'

const PLAN_LABELS: Record<string, string> = {
  mensal:    'Plano Mensal',
  anual:     'Plano Anual',
  vitalicio: 'Plano Fundador',
}

function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [planLabel, setPlanLabel] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const { setUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const t = params.get('token')
    const e = params.get('email')

    if (!t) {
      router.replace('/#planos')
      return
    }

    setToken(t)
    if (e) setForm(f => ({ ...f, email: decodeURIComponent(e) }))

    fetch(`/api/auth/verify-invite?token=${t}`)
      .then(r => r.json())
      .then(data => {
        if (!data.valid) {
          setInviteError(data.error ?? 'Convite inválido.')
        } else {
          setForm(f => ({
            ...f,
            email: data.email ?? f.email,
            name: f.name || data.name || '',
          }))
          setPlanLabel(PLAN_LABELS[data.planKey] ?? data.planKey)
        }
      })
      .catch(() => setInviteError('Erro ao verificar o convite.'))
      .finally(() => setValidating(false))
  }, [params, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast('As senhas não conferem', 'error'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, token }),
      })
      const data = await res.json()
      if (!res.ok) { toast(data.error, 'error'); return }
      setUser(data.user)
      toast('Bem-vindo ao Ascend System!', 'success')
      router.push('/dashboard')
    } catch {
      toast('Erro ao criar conta.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="w-full max-w-md relative z-10 flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        <p className="text-slate-400 text-sm">Verificando seu convite...</p>
      </div>
    )
  }

  if (inviteError) {
    return (
      <div className="w-full max-w-md relative z-10">
        <div className="glass neon-border rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-white mb-2">Convite inválido</h1>
          <p className="text-slate-400 text-sm mb-6">{inviteError}</p>
          <Button variant="primary" className="w-full" onClick={() => router.push('/#planos')}>
            Ver planos
          </Button>
          <p className="text-slate-500 text-xs mt-4">
            Já tem uma conta?{' '}
            <a href="/login" className="text-indigo-400 hover:text-indigo-300">Entrar</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="glass neon-border rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Image src="/logo.png" alt="Ascend System" width={80} height={80} className="rounded-2xl neon-glow" priority />
          </div>
          <h1 className="text-2xl font-bold text-white">Despertar no Sistema</h1>
          {planLabel && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold border border-violet-500/30">
              ✓ {planLabel} ativado
            </span>
          )}
          <p className="text-slate-400 text-sm mt-2">Configure seu acesso e comece a evoluir</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            placeholder="Seu nome de caçador"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            icon={<User size={16} />}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            icon={<Mail size={16} />}
            required
            disabled
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres com 1 número"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            icon={<Lock size={16} />}
            required
          />
          <Input
            label="Confirmar Senha"
            type="password"
            placeholder="Repita sua senha"
            value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })}
            icon={<Lock size={16} />}
            required
          />

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
            {loading ? 'Criando conta...' : 'Começar a Evoluir'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Já tem uma conta?{' '}
            <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Entrar
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md relative z-10 flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        <p className="text-slate-400 text-sm">Carregando...</p>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
