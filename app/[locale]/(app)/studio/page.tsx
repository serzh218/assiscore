"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea, Button, Progress, Input, Badge, Card } from "@/components/ui";
import { useSession } from "next-auth/react";
import { estimateGenerationCost } from "@/lib/tokens";
import { useRouter } from "next/navigation";

export default function StudioPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [text, setText] = useState("");
  const [useFigma, setUseFigma] = useState(false);
  const [figma, setFigma] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const stepMap: Record<string, number> = { plan: 0, code: 1, test: 2, build: 3, ready: 4 };
  const cost = estimateGenerationCost({ textLen: text.length, hasFigma: useFigma && figma.trim().length > 0 });
  const tokens = (session?.user as any)?.tokens ?? 0;
  const canAfford = tokens >= cost;

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const startPolling = (id: string) => {
    pollingRef.current = setInterval(async () => {
      const res = await fetch(`/api/generate/status?projectId=${id}`);
      const data = await res.json();
      setStatus(data.status);
      setLogs(data.logs ?? []);
      if (data.status === "ready" && pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }, 2000);
  };

  const handleGenerate = async () => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text, figmaUrl: useFigma ? figma : undefined }),
    });
    const data = await res.json();
    if (data.projectId) {
      setProjectId(data.projectId);
      setStatus("plan");
      setLogs([]);
      startPolling(data.projectId);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-display-2 font-semibold">Создай полноценный сайт с ИИ</h1>
      <Textarea
        placeholder="Опиши, какой сайт нужен. Можно коротко, можно подробно."
        className="min-h-[200px]"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="secondary" onClick={() => setUseFigma((v) => !v)}>
          Импорт из Figma
        </Button>
        {useFigma && (
          <Input
            placeholder="Вставьте ссылку или загрузите JSON-экспорт"
            value={figma}
            onChange={(e) => setFigma(e.target.value)}
            className="max-w-xs"
          />
        )}
        <Button variant="secondary">Прикрепить файлы</Button>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" disabled className="h-4 w-4 rounded border border-border bg-bg-elev" />
          Приватный проект (PRO)
        </label>
      </div>
      <Button disabled={!canAfford} onClick={handleGenerate}>
        Создать сайт
      </Button>
      <p className="text-sm text-muted">
        Ориентировочная стоимость: ~{cost} токенов
        {!canAfford && tokens > 0 && (
          <span className="ml-2">Недостаточно токенов</span>
        )}
      </p>
      {status && <Progress step={stepMap[status]} />}
      {status && <Badge>{status}</Badge>}
      {logs.length > 0 && (
        <Card className="h-40 overflow-y-auto p-2 font-mono text-sm">
          {logs.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
          <div ref={logsEndRef} />
        </Card>
      )}
      {status === "ready" && projectId && (
        <Button onClick={() => router.push(`/projects/${projectId}`)}>Открыть проект</Button>
      )}
    </div>
  );
}
