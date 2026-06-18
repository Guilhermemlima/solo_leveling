'use client'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
        <div className="relative">
          {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>}
          <input
            ref={ref}
            className={`
              w-full bg-slate-900/60 border rounded-lg text-slate-100 placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
              transition-all duration-200
              ${error ? 'border-red-500/50' : 'border-slate-700/60'}
              ${icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5'}
              text-sm
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
        <select
          ref={ref}
          className={`
            w-full bg-slate-900/60 border rounded-lg text-slate-100
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
            transition-all duration-200 px-4 py-2.5 text-sm cursor-pointer
            ${error ? 'border-red-500/50' : 'border-slate-700/60'}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
