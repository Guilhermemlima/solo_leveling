'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Mail, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast('As senhas não conferem', 'error'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
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

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="glass neon-border rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 neon-glow">
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Criar Conta</h1>
          <p className="text-slate-400 text-sm mt-1">Inicie sua jornada de evolução pessoal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome" placeholder="Seu nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} icon={<User size={16} />} required />
          <Input label="Email" type="email" placeholder="seu@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} icon={<Mail size={16} />} required />
          <Input label="Senha" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} icon={<Lock size={16} />} required />
          <Input label="Confirmar Senha" type="password" placeholder="Repita sua senha" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} icon={<Lock size={16} />} required />

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
            {loading ? 'Criando conta...' : 'Começar a Evoluir'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
