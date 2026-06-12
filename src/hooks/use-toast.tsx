"use client"

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react"

// ── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  title: string
  message: string
  type: ToastType
  createdAt: number
}

interface ToastContextValue {
  toasts: Toast[]
  showToast: (title: string, message: string, type?: ToastType) => void
  dismissToast: (id: string) => void
}

// ── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────────

const TOAST_DURATION = 3000 // 3 second auto-dismiss

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (title: string, message: string, type: ToastType = "info") => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const toast: Toast = { id, title, message, type, createdAt: Date.now() }
      setToasts((prev) => [...prev, toast])

      const timer = setTimeout(() => {
        dismissToast(id)
      }, TOAST_DURATION)
      timersRef.current.set(id, timer)
    },
    [dismissToast]
  )

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
