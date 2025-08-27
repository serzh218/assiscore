import Link from 'next/link';
import { Card, CardContent, CardTitle, Button } from '@/components/ui';
import { ForkButton } from './ForkButton';
import { getCurrentUser } from '@/lib/auth';

export const generateMetadata = () => ({
  title: 'Галерея проектов',
  description: 'Публичные проекты пользователей',
});

export default async function ExplorePage({ searchParams }: { searchParams: { order?: string } }) {
  const order = searchParams.order === 'popular' ? 'popular' : 'new';
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/explore?order=${order}`, { cache: 'no-store' });
  const data = await res.json();
  const user = await getCurrentUser();
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Link href="/explore?order=new" className={order === 'new' ? 'font-bold' : ''}>
          Новые
        </Link>
        <Link href="/explore?order=popular" className={order === 'popular' ? 'font-bold' : ''}>
          Популярные
        </Link>
      </div>
      {data.items.length === 0 ? (
        <div>Пока нет проектов</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {data.items.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="space-y-2 p-4">
                <div className="h-32 rounded bg-border overflow-hidden">
                  {p.previewUrl ? <img src={p.previewUrl} alt="preview" className="h-full w-full object-cover" /> : null}
                </div>
                <CardTitle className="text-base truncate">{p.title}</CardTitle>
                <div className="text-sm text-muted">{p.author?.name}</div>
                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href={`/projects/${p.id}`}>Открыть</Link>
                  </Button>
                  <ForkButton projectId={p.id} authenticated={!!user} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
