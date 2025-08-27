import React from "react";

export const TableRowSkeleton = () => (
  <tr className="pulse">
    <td className="py-2">
      <div className="h-4 w-32 rounded bg-bg-elev" />
    </td>
    <td className="py-2">
      <div className="h-4 w-24 rounded bg-bg-elev" />
    </td>
    <td className="py-2">
      <div className="h-4 w-20 rounded bg-bg-elev" />
    </td>
  </tr>
);
