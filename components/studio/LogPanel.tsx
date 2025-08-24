'use client';

import { useEffect, useRef, useState } from 'react';

interface LogPanelProps {
  sandboxId: string;
}

interface LogEntry {
  stream: 'stdout' | 'stderr';
  line: string;
}

export default function LogPanel({ sandboxId }: LogPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sandboxId) return;
    const es = new EventSource(`/api/sandbox/logs/${sandboxId}`);

    es.onmessage = (event) => {
      try {
        const data: LogEntry = JSON.parse(event.data);
        setLogs((prev) => [...prev, data]);
      } catch (e) {
        console.error('Failed to parse log entry', e);
      }
    };

    es.onerror = (err) => {
      console.error('Log stream error', err);
      es.close();
    };

    return () => {
      es.close();
    };
  }, [sandboxId]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={containerRef}
      className="bg-black text-green-500 p-2 font-mono text-xs h-48 overflow-auto rounded"
    >
      {logs.map((log, idx) => (
        <div key={idx} className={log.stream === 'stderr' ? 'text-red-500' : ''}>
          {log.line}
        </div>
      ))}
    </div>
  );
}
