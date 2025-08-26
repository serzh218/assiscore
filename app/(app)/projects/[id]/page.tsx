import { Badge, Tabs, TabsList, TabsTrigger, TabsContent, Button } from "@/components/ui";

export default function ProjectPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-display-3 font-semibold">Название проекта</h1>
        <Badge>Черновик</Badge>
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
          <TabsContent value="chat">Чат</TabsContent>
          <TabsContent value="diffs">Дифы</TabsContent>
        </Tabs>
      </div>
      <div className="h-40 overflow-auto rounded bg-bg-elev p-4 font-mono text-sm">логи...</div>
      <div className="flex flex-wrap gap-4">
        <Button variant="secondary">Скачать ZIP</Button>
        <Button variant="secondary" disabled title="Доступно на PRO">
          Экспорт в GitHub (PRO)
        </Button>
        <Button variant="secondary" disabled title="Доступно на PRO">
          Опубликовать (PRO)
        </Button>
      </div>
    </div>
  );
}
