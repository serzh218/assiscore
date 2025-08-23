import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <span className={cn("text-accent", className)}>
      AssisCore
    </span>
  );
}
