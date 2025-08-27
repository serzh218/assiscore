import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

const badgeStyles = cva(
  "inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium transition-base",
  {
    variants: {
      variant: {
        info: "bg-primary text-primary-fore",
        success: "bg-green-500 text-primary-fore",
        warning: "bg-yellow-500 text-primary-fore",
        error: "bg-red-500 text-primary-fore",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeStyles> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={clsx(badgeStyles({ variant }), className)} {...props} />
);
