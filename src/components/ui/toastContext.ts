import { createContext, useContext } from 'react'

export type ToastOptions = {
  message: string
  actionLabel?: string
  onAction?: () => void
}

export const ToastContext = createContext<(options: ToastOptions) => void>(() => {})

/** Returns a function that shows a toast message, e.g. showToast({ message: 'Saved' }). */
export function useToast() {
  return useContext(ToastContext)
}
