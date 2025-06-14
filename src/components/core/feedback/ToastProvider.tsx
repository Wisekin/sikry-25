"use client"

import { createContext, useContext, type ReactNode } from "react"
import { Toast } from "./Toast"
import { useToast } from "@/hooks/use-toast"

const ToastContext = createContext<ReturnType<typeof useToast> | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastUtils = useToast()

  return (
    <ToastContext.Provider value={toastUtils}>
      {children}
      {toastUtils.toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => toastUtils.removeToast(toast.id)} />
      ))}
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider")
  }
  return context
}
