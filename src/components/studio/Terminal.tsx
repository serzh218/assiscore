'use client';

import { useEffect, useState, useRef } from 'react';

interface TerminalProps {
  sandboxId: string | null;
}

export const Terminal = ({ sandboxId }: TerminalProps) => {
  const [logs, setLogs] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sandboxId) return;

    // Подключаемся к нашему будущему стриминг-серверу
    const eventSource = new EventSource(`/api/logs/${sandboxId}`);

    eventSource.onmessage = (event) => {
      setLogs((prevLogs) => [...prevLogs, event.data]);
    };

    eventSource.onerror = () => {
      // Можно добавить логику обработки ошибок
      eventSource.close();
    };

    // Закрываем соединение при размонтировании компонента
    return () => {
      eventSource.close();
    };
  }, [sandboxId]);

  // Автоматическая прокрутка вниз
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      className="bg-slate-900 h-full w-full rounded-lg p-4 font-mono text-sm text-white overflow-y-auto"
      ref={terminalRef}
    >
      {logs.map((log, index) => (
        <div key={index} dangerouslySetInnerHTML={{ __html: log }} />
      ))}
    </div>
  );
};

