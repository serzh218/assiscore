import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <span className={cn("h-8 flex items-center text-2xl font-bold text-[#8b5cf6]", className)}>
      AssisCore
    </span>
  );
}
