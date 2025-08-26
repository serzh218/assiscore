import * as React from "react";
import { clsx } from "clsx";

const steps = ["План", "Код", "Тесты", "Сборка", "Готово"] as const;
export type Step = typeof steps[number];

export interface ProgressProps {
  step: number; // 0-based index
}

export const Progress = ({ step }: ProgressProps) => {
  const pct = (step / (steps.length - 1)) * 100;
  return (
    <div className="w-full">
      <div className="h-2 w-full rounded bg-border">
        <div
          className="h-full rounded bg-primary transition-all duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        {steps.map((s, i) => (
          <span key={s} className={clsx(i <= step && "text-text")}>{s}</span>
        ))}
      </div>
    </div>
  );
};
