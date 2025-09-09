import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type Toast = { id: number; message: string; variant: 'default' | 'success' | 'error' }
type ToastCtx = { notify: (message: string) => void; notifySuccess: (message: string) => void; notifyError: (message: string) => void }

const ToastContext = createContext<ToastCtx | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((message: string, variant: Toast['variant']) => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, variant }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }, [])
  const notify = useCallback((message: string) => push(message, 'default'), [push])
  const notifySuccess = useCallback((message: string) => push(message, 'success'), [push])
  const notifyError = useCallback((message: string) => push(message, 'error'), [push])
  const value = useMemo(() => ({ notify, notifySuccess, notifyError }), [notify, notifySuccess, notifyError])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] mx-auto flex max-w-md flex-col gap-2 p-2">
        {toasts.map((t) => {
          const style =
            t.variant === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : t.variant === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-gray-200 bg-white'
          return (
            <div key={t.id} className={`pointer-events-auto rounded-xl border px-4 py-2 text-sm shadow-lg ${style}`}>
              {t.message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}


