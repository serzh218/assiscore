import * as TabsPrimitive from "@radix-ui/react-tabs";
import { clsx } from "clsx";

export const Tabs = TabsPrimitive.Root;

export const TabsList = ({ className, ...props }: TabsPrimitive.TabsListProps) => (
  <TabsPrimitive.List
    className={clsx("flex border-b border-border", className)}
    {...props}
  />
);

export const TabsTrigger = ({ className, ...props }: TabsPrimitive.TabsTriggerProps) => (
  <TabsPrimitive.Trigger
    className={clsx(
      "relative px-3 py-2 text-sm text-muted transition-colors duration-150 data-[state=active]:text-text",
      "after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-full after:bg-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-150 data-[state=active]:after:scale-x-100",
      className
    )}
    {...props}
  />
);

export const TabsContent = ({ className, ...props }: TabsPrimitive.TabsContentProps) => (
  <TabsPrimitive.Content className={clsx("pt-4", className)} {...props} />
);
