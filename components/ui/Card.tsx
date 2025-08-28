import * as React from 'react'
import { clsx } from 'clsx'

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'rounded-2xl border border-border bg-bg-elev shadow-lg hover:shadow-xl hover:scale-105 text-text transition-base',
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('p-4 border-b border-border', className)} {...props} />
)

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={clsx('text-display-3 font-semibold', className)} {...props} />
)

export const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={clsx('text-sm text-muted', className)} {...props} />
)

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('p-4', className)} {...props} />
)

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('p-4 border-t border-border', className)} {...props} />
)
