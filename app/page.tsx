'use client';

import { useState } from 'react';
import GradientCard from '@/components/GradientCard';

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [projectType, setProjectType] = useState<'website' | 'application' | 'bot'>('website');
  const [status, setStatus] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Генерация запущена...');
    try {
      const res = await fetch('/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, projectType }),
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-text">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-[move-glow_20s_ease-in-out_infinite_alternate] absolute left-1/2 top-1/2 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-accent via-pink-500 to-yellow-500 opacity-30 blur-3xl" />
      </div>

      <header className="animate-[fadeInDown_0.8s_ease-out_0.5s_forwards] py-6 text-center text-3xl font-bold">AssisCore</header>

      <main className="animate-[fadeInUp_0.8s_ease-out_0.2s_forwards] flex flex-1 flex-col items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl space-y-4"
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Опишите ваш проект..."
            className={`min-h-[160px] w-full rounded-md border bg-transparent p-4 focus:outline-none ${
              isFocused ? 'border-accent' : 'border-gray-300'
            }`}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              {(['website', 'application', 'bot'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setProjectType(type)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    projectType === type
                      ? 'bg-accent text-white border-accent'
                      : 'bg-card text-text border-gray-300'
                  }`}
                >
                  {type === 'website'
                    ? 'Сайт'
                    : type === 'application'
                    ? 'Приложение'
                    : 'Бот'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4"
                />
                Приватный
              </label>
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50"
              >
                Сгенерировать
              </button>
            </div>
          </div>
        </form>

        {status && (
          <p className="mt-4 text-center text-sm text-gray-500">{status}</p>
        )}

        <div className="mt-8 w-full max-w-md">
          <GradientCard />
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-gray-500">
        © 2024 AssisCore
      </footer>
    </div>
  );
}

