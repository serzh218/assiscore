import * as React from "react";
import { ChevronsUpDown } from "lucide-react";

export interface TableProps {
  headers: string[];
  children?: React.ReactNode;
}

export const Table = ({ headers, children }: TableProps) => (
  <table className="w-full text-left text-sm text-text">
    <thead className="border-b border-border text-muted">
      <tr>
        {headers.map(h => (
          <th key={h} className="py-2">
            <div className="flex items-center gap-1">
              {h}
              <ChevronsUpDown className="h-3 w-3" />
            </div>
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-border text-sm">{children}</tbody>
  </table>
);
