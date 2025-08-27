'use client';

import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';

export function ForkButton({ projectId, authenticated }: { projectId: string; authenticated: boolean }) {
  const router = useRouter();
  const onClick = async () => {
    if (!authenticated) {
      alert('Войдите, чтобы скопировать');
      return;
    }
    const res = await fetch(`/api/projects/${projectId}/fork`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      alert('Скопировано');
      router.push(`/projects/${data.projectId}`);
    }
  };
  return (
    <Button size="sm" variant="secondary" onClick={onClick}>
      Скопировать
    </Button>
  );
}
