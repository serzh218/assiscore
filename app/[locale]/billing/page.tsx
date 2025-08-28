'use client'

import { useSearchParams } from 'next/navigation'

export default function BillingResultPage() {
  const params = useSearchParams()
  const status = params.get('status')

  let message = 'Payment error'
  if (status === 'success') message = 'Payment successful'
  else if (status === 'processing') message = 'Payment processing'

  return <div className="p-4 text-center">{message}</div>
}
