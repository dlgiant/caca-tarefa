"use client"

import { Toaster } from "@/components/ui/sonner"

export function NotificationProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={5000}
    />
  )
}
