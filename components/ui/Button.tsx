import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

const buttonStyles = cva(
  'inline-flex items-center justify-center font-medium rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-base',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-fore hover:bg-primary/90',
        secondary: 'bg-bg-elev text-text hover:bg-bg-elev/80',
        ghost: 'bg-transparent text-text hover:bg-bg-elev',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  loading?: boolean
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, asChild, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref as any}
        className={clsx(buttonStyles({ variant, size }), className)}
        disabled={loading || props.disabled}
        aria-busy={loading}
        aria-disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'
