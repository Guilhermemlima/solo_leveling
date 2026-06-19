'use client'
import { useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export default function SupportPage() {
  const [form, setForm] = useState({ category: 'IDEA', message: '', rating: 5 })
  const [sending, setSending] = useState(false)
  const { toast } = useToast()
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSending(true)
    const response = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await response.json()
    if (response.ok) { toast('Mensagem enviada. Obrigado por ajudar o Ascend a evoluir.', 'success'); setForm({ ...form, message: '' }) }
    else toast(data.error, 'error')
    setSending(false)
  }
  return <div className="max-w-2xl space-y-6">
    <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><MessageCircle className="text-indigo-400" /> Feedback e suporte</h1>
      <p className="text-sm text-slate-400">Um canal claro, sem esconder suporte atrás de assinatura.</p></div>
    <form onSubmit={submit} className="glass neon-border rounded-2xl p-6 space-y-4">
      <Select label="Assunto" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option value="IDEA">Sugestão</option><option value="BUG">Problema técnico</option><option value="SUPPORT">Ajuda</option><option value="OTHER">Outro</option></Select>
      <Input label="Mensagem" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Conte o que aconteceu ou o que podemos melhorar..." required />
      <Select label="Como está sua experiência?" value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })}>{[5,4,3,2,1].map(n => <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5-n)}</option>)}</Select>
      <Button loading={sending} type="submit"><Send size={15} /> Enviar</Button>
    </form>
  </div>
}
