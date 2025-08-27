"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { COSTS } from "@/lib/limits";
import { Badge, Tabs, TabsList, TabsTrigger, TabsContent, Button, Textarea } from "@/components/ui";

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { data: session } = useSession();
  const isPro = session?.user?.plan === "PRO";
  const githubLinked = session?.user?.githubLinked;
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [patches, setPatches] = useState<any[]>([]);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);

  const fetchPatches = async () => {
    const res = await fetch(`/api/projects/${projectId}/patches`);
    if (res.ok) {
      const data = await res.json();
      setPatches(data.patches || []);
    }
  };

  useEffect(() => {
    fetchPatches();
  }, []);

  const send = async () => {
    setSending(true);
    try {
      await fetch(`/api/projects/${projectId}/patch`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      setMessage("");
      await fetchPatches();
    } finally {
      setSending(false);
    }
  };

  const showDiff = async (id: string) => {
    const res = await fetch(`/api/projects/${projectId}/patches/${id}`);
    if (res.ok) {
      const data = await res.json();
      alert(data.diff);
    }
  };

  const removePatch = async (id: string) => {
    await fetch(`/api/projects/${projectId}/patches/${id}`, { method: "DELETE" });
    await fetchPatches();
    alert("Откат скоро появится");
  };

  const toggleVisibility = async () => {
    const newVis = visibility === "public" ? "private" : "public";
    if (newVis === "private" && !isPro) {
      alert("Приватные проекты доступны на PRO");
      return;
    }
    const res = await fetch(`/api/projects/${projectId}/visibility`, {
      method: "POST",
      body: JSON.stringify({ visibility: newVis }),
    });
    if (res.ok) {
      setVisibility(newVis);
    }
  };

  const exportGithub = async () => {
    const res = await fetch(`/api/projects/${projectId}/export/github`, {
      method: "POST",
      body: JSON.stringify({ visibility }),
    });
    if (res.ok) {
      const data = await res.json();
      setRepoUrl(data.repoUrl);
      toast.success(`Экспортировано в GitHub: ${data.repoUrl}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-display-3 font-semibold">Название проекта</h1>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={visibility === "public"} onChange={toggleVisibility} />
          {visibility === "public" ? "Публичный" : "Приватный (PRO)"}
        </label>
        <Badge>Черновик</Badge>
      </div>
      <div className="text-xs text-muted">
        Публичные проекты попадают в Галерею и могут быть скопированы другими пользователями.
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex h-64 items-center justify-center rounded bg-border">iFrame preview</div>
        <Tabs defaultValue="files" className="w-full">
          <TabsList>
            <TabsTrigger value="files">Файлы</TabsTrigger>
            <TabsTrigger value="chat">Чат-доработки</TabsTrigger>
            <TabsTrigger value="diffs">История/дифы</TabsTrigger>
          </TabsList>
          <TabsContent value="files">Файлы</TabsContent>
          <TabsContent value="chat">
            <div className="space-y-2">
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
              <div className="text-sm text-muted">Стоимость доработки: {COSTS.patch} токенов</div>
              <Button onClick={send} disabled={sending || !message}>
                Отправить
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="diffs">
            <ul className="space-y-2">
              {patches.map((p) => (
                <li key={p.id} className="flex items-center gap-2">
                  <span>
                    {new Date(p.createdAt).toLocaleString()} – {p.costTokens} токенов
                  </span>
                  <Button size="sm" onClick={() => showDiff(p.id)}>
                    Показать diff
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => removePatch(p.id)}>
                    Откатить
                  </Button>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </div>
      <div className="h-40 overflow-auto rounded bg-bg-elev p-4 font-mono text-sm">логи...</div>
      <div className="flex flex-wrap gap-4">
        <Button variant="secondary">Скачать ZIP</Button>
        <div className="space-y-1">
          <Button
            variant="secondary"
            disabled={!isPro || !githubLinked}
            title={!isPro ? "Экспорт доступен только на PRO" : !githubLinked ? "Подключите GitHub в настройках" : undefined}
            onClick={exportGithub}
          >
            Экспорт в GitHub
          </Button>
          {repoUrl && (
            <div className="text-xs text-muted break-all">{repoUrl}</div>
          )}
        </div>
        <Button variant="secondary" disabled title="Доступно на PRO">
          Опубликовать (PRO)
        </Button>
      </div>
    </div>
  );
}
