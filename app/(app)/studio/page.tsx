import { Textarea, Button, Progress } from "@/components/ui";

export default function StudioPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-display-2 font-semibold">Создай полноценный сайт с ИИ</h1>
      <Textarea
        placeholder="Опиши, какой сайт нужен. Можно коротко, можно подробно."
        className="min-h-[200px]"
      />
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="secondary">Импорт из Figma</Button>
        <Button variant="secondary">Прикрепить файлы</Button>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" disabled className="h-4 w-4 rounded border border-border bg-bg-elev" />
          Приватный проект (PRO)
        </label>
      </div>
      <Button>Создать сайт</Button>
      <p className="text-sm text-muted">Ориентировочная стоимость: ~N токенов</p>
      <Progress step={0} />
    </div>
  );
}
