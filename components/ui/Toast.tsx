'use client'
import { Toaster as SonnerToaster, toast, type ToasterProps } from 'sonner'

export const Toaster = (props: ToasterProps) => (
  <SonnerToaster richColors position="top-right" {...props} />
)

export function useToast() {
  return { toast }
}
