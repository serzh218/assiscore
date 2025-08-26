'use client';
import { Toaster as SonnerToaster, toast } from "sonner";

export const Toaster = SonnerToaster;

export function useToast() {
  return { toast };
}
