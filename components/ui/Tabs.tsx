import * as TabsPrimitive from '@radix-ui/react-tabs'
import { clsx } from 'clsx'

export const Tabs = TabsPrimitive.Root

export const TabsList = ({ className, ...props }: TabsPrimitive.TabsListProps) => (
  <TabsPrimitive.List className={clsx('flex gap-2', className)} {...props} />
)

export const TabsTrigger = ({ className, ...props }: TabsPrimitive.TabsTriggerProps) => (
  <TabsPrimitive.Trigger
    className={clsx(
      'rounded-2xl bg-bg-elev px-4 py-2 text-sm text-muted shadow-lg hover:bg-bg-elev/80 hover:shadow-xl data-[state=active]:bg-primary data-[state=active]:text-primary-fore transition-base',
      className,
    )}
    {...props}
  />
)

export const TabsContent = ({ className, ...props }: TabsPrimitive.TabsContentProps) => (
  <TabsPrimitive.Content className={clsx('pt-4', className)} {...props} />
)
