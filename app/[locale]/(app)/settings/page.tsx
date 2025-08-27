"use client";

import { Input, Button } from "@/components/ui";
import { signIn, useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const githubLinked = session?.user.githubLinked;
  const githubUsername = session?.user.githubUsername;

  const disconnect = async () => {
    await fetch("/api/settings/github/disconnect", { method: "POST" });
    await update();
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-display-3 font-semibold">Профиль</h2>
        <Input placeholder="Имя" />
        <Input type="file" />
      </section>
      <section className="space-y-2">
        <h2 className="text-display-3 font-semibold">Интеграции</h2>
        {!githubLinked ? (
          <Button size="sm" onClick={() => signIn("github")}>Подключить GitHub</Button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="text-sm">GitHub подключён как {githubUsername}</div>
            <Button size="sm" variant="secondary" onClick={disconnect}>
              Отключить
            </Button>
          </div>
        )}
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
