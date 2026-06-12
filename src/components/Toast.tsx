"use client"

import React, { useEffect, useState } from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { useToast, type Toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// ── Icons per type ───────────────────────────────────────────────────────────

const iconMap: Record<Toast["type"], React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap: Record<Toast["type"], string> = {
  success: "border-l-green-500 bg-green-50 dark:bg-green-950/30",
  error: "border-l-red-500 bg-red-50 dark:bg-red-950/30",
  warning: "border-l-amber-500 bg-amber-50 dark:bg-amber-950/30",
  info: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30",
}

const iconColorMap: Record<Toast["type"], string> = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-blue-600 dark:text-blue-400",
}

// ── Single toast item ────────────────────────────────────────────────────────

function ToastItem({ toast }: { toast: Toast }) {
  const { dismissToast } = useToast()
  const [visible, setVisible] = useState(false)
  const Icon = iconMap[toast.type]

  // Animate in on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border border-l-4 p-4 shadow-lg transition-all duration-300",
        colorMap[toast.type],
        visible
          ? "translate-x-0 opacity-100"
          : "translate-x-4 opacity-0"
      )}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", iconColorMap[toast.type])} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-sm text-muted-foreground">{toast.message}</p>
        )}
      </div>

      <button
        onClick={() => dismissToast(toast.id)}
        className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-target inline-flex items-center justify-center"
        aria-label="Fechar notificação"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

// ── Toast container ──────────────────────────────────────────────────────────

export function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
