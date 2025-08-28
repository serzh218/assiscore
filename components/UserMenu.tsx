'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { LogOut, User, CreditCard } from 'lucide-react'

interface Props {
  user: any
  prefix: string
  profileLabel: string
  billingLabel: string
  signOutLabel: string
}

export default function UserMenu({
  user,
  prefix,
  profileLabel,
  billingLabel,
  signOutLabel,
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border bg-bg-elev shadow-lg hover:shadow-xl transition"
      >
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="avatar" className="h-full w-full object-cover" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-bg-elev p-2 shadow-lg">
          <Link
            href={`${prefix}/account`}
            className="flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-bg/50 transition"
          >
            <User className="h-4 w-4" /> {profileLabel}
          </Link>
          <Link
            href={`${prefix}/billing`}
            className="flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-bg/50 transition"
          >
            <CreditCard className="h-4 w-4" /> {billingLabel}
          </Link>
          <form action={`${prefix}/auth/sign-out`} method="post">
            <button className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-bg/50 transition">
              <LogOut className="h-4 w-4" /> {signOutLabel}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
