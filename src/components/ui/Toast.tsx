import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from './Icon'
import { ToastContext, type ToastOptions } from './toastContext'

/*
  A small message that pops up at the bottom of the screen for a few seconds,
  optionally with an action button (e.g. "Deleted task. [Undo]").
*/

type ToastState = ToastOptions & { id: number }

const TOAST_DURATION_MS = 6000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const nextId = useRef(1)

  const showToast = useCallback((options: ToastOptions) => {
    setToast({ ...options, id: nextId.current++ })
  }, [])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), TOAST_DURATION_MS)
    return () => window.clearTimeout(timeout)
  }, [toast])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* The live region is always present so screen readers announce new messages. */}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div className="toast" key={toast.id}>
            <span>{toast.message}</span>
            {toast.actionLabel && toast.onAction && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  toast.onAction?.()
                  setToast(null)
                }}
              >
                {toast.actionLabel}
              </button>
            )}
            <button type="button" className="icon-btn toast-close" aria-label="Dismiss message" onClick={() => setToast(null)}>
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

