'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [projectType, setProjectType] = useState<'website' | 'application' | 'bot'>('website');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Генерация запущена...');
    try {
      const res = await fetch('/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, projectType })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Не удалось начать генерацию');
      }
      setStatus('Генерация запущена в песочнице');
    } catch (err: any) {
      setStatus(err.message);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold text-center">AssisCore</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Опишите ваш проект..."
          className="min-h-[160px]"
        />
        <div className="flex justify-center gap-2">
          {(['website','application','bot'] as const).map(type => (
            <Button
              key={type}
              type="button"
              variant={projectType === type ? 'default' : 'outline'}
              onClick={() => setProjectType(type)}
            >
              {type === 'website' ? 'Сайт' : type === 'application' ? 'Приложение' : 'Бот'}
            </Button>
          ))}
        </div>
        <div className="flex justify-center">
          <Button type="submit" disabled={!prompt.trim()}>Сгенерировать</Button>
        </div>
      </form>
      {status && <p className="text-center text-sm text-gray-600">{status}</p>}
    </main>
  );
}
