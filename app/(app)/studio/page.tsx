"use client";

import { useState } from "react";
import { Textarea, Button, Progress, Input } from "@/components/ui";
import { useSession } from "next-auth/react";
import { estimateGenerationCost } from "@/lib/tokens";

export default function StudioPage() {
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const [useFigma, setUseFigma] = useState(false);
  const [figma, setFigma] = useState("");
  const cost = estimateGenerationCost({ textLen: text.length, hasFigma: useFigma && figma.trim().length > 0 });
  const tokens = (session?.user as any)?.tokens ?? 0;
  const canAfford = tokens >= cost;

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
            placeholder="Ссылка на Figma"
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
      <Button disabled={!canAfford}>Создать сайт</Button>
      <p className="text-sm text-muted">
        Ориентировочная стоимость: ~{cost} токенов
        {!canAfford && tokens > 0 && (
          <span className="ml-2">Недостаточно токенов</span>
        )}
      </p>
      <Progress step={0} />
    </div>
  );
}
