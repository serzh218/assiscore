'use client';
import { Toaster as SonnerToaster, toast } from "sonner";

export const Toaster = () => (
  <SonnerToaster toastOptions={{ className: "fade-in transition-base" }} />
);

export function useToast() {
  return { toast };
}
