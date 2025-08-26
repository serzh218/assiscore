import { Input, Button } from "@/components/ui";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-display-3 font-semibold">Профиль</h2>
        <Input placeholder="Имя" />
        <Input type="file" />
      </section>
      <section className="space-y-2">
        <h2 className="text-display-3 font-semibold">Интеграции</h2>
        <div className="flex gap-4">
          <Button size="sm">Connect GitHub</Button>
          <Button size="sm" variant="secondary">Disconnect</Button>
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-display-3 font-semibold">Приватность</h2>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" disabled className="h-4 w-4 rounded border border-border bg-bg-elev" />
          Приватные проекты (PRO)
        </label>
      </section>
    </div>
  );
}
