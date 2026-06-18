'use client'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  danger, loading, onConfirm, onCancel,
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm glass neon-border rounded-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto ${danger ? 'bg-red-500/15 border border-red-500/30' : 'bg-indigo-500/15 border border-indigo-500/30'}`}>
          <AlertTriangle size={22} className={danger ? 'text-red-400' : 'text-indigo-400'} />
        </div>
        <h2 className="text-lg font-bold text-white text-center mb-2">{title}</h2>
        <p className="text-sm text-slate-400 text-center mb-6">{message}</p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel} className="flex-1">{cancelLabel}</Button>
          <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
