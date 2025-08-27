import * as React from "react";
import ReactDiffViewer from "react-diff-viewer-continued";

export interface DiffViewerProps {
  oldValue: string;
  newValue: string;
}

export const DiffViewer = ({ oldValue, newValue }: DiffViewerProps) => (
  <ReactDiffViewer oldValue={oldValue} newValue={newValue} splitView={false} />
);
