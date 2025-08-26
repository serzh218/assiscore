import * as React from "react";

export interface DiffViewerProps {
  diff: string;
}

export const DiffViewer = ({ diff }: DiffViewerProps) => (
  <pre className="overflow-auto rounded-md bg-bg-elev p-4 font-mono text-sm leading-relaxed">
    {diff.split('\n').map((line, i) => {
      const cls = line.startsWith('+')
        ? 'text-green-400'
        : line.startsWith('-')
        ? 'text-red-400'
        : '';
      return (
        <div key={i} className={cls}>
          {line}
        </div>
      );
    })}
  </pre>
);
