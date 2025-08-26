import { Card, CardContent, CardTitle, Button } from "@/components/ui";

export default function ExplorePage() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <CardContent className="space-y-2">
            <div className="h-32 rounded bg-border" />
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Проект {i}</CardTitle>
              <Button size="sm" variant="secondary">Скопировать</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
