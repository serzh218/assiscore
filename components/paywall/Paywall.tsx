'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui'
import { useTranslations } from 'next-intl'

interface PaywallProps {
  open: boolean
  onClose: () => void
}

export function Paywall({ open, onClose }: PaywallProps) {
  const t = useTranslations('paywall')
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-80 -translate-x-1/2 -translate-y-1/2 rounded bg-background p-6 shadow-lg">
          <Dialog.Title className="mb-2 text-lg font-semibold">{t('title')}</Dialog.Title>
          <Dialog.Description className="mb-4 text-sm text-muted">
            {t('description')}
          </Dialog.Description>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost">{t('close')}</Button>
            </Dialog.Close>
            <Button asChild>
              <a href="/pricing">{t('upgrade')}</a>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Paywall
