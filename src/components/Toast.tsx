'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = (id: number) =>
    setToasts(prev => prev.filter(t => t.id !== id))

  const icons = {
    success: <CheckCircle size={16} className="shrink-0 text-emerald-400" />,
    error: <XCircle size={16} className="shrink-0 text-red-400" />,
    warning: <AlertTriangle size={16} className="shrink-0 text-amber-400" />,
  }

  const borders = {
    success: 'border-emerald-500/30',
    error: 'border-red-500/30',
    warning: 'border-amber-500/30',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-24 right-6 z-[60] flex flex-col gap-2 w-80">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-start gap-3 bg-zinc-900 border ${borders[t.type]} rounded-xl px-4 py-3 shadow-2xl animate-in slide-in-from-right-4 fade-in duration-300`}
          >
            {icons[t.type]}
            <p className="text-xs text-zinc-200 leading-relaxed flex-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-zinc-500 hover:text-white transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx.toast
}
