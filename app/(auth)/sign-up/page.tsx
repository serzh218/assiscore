'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@/components/ui';
import { Toaster, toast } from 'sonner';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) {
      toast.success('Аккаунт создан. Войдите, чтобы продолжить.');
      router.push('/auth/sign-in');
    } else if (res.status === 409) {
      toast.error('Пользователь с такой почтой уже существует.');
    } else {
      toast.error('Ошибка регистрации.');
    }
  };

  return (
    <div className="mx-auto max-w-sm p-4">
      <h1 className="mb-4 text-xl font-semibold">Создать аккаунт</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя (опционально)"
        />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          required
        />
        <Button type="submit">Продолжить</Button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          Войти
        </Link>
      </p>
      <Toaster />
    </div>
  );
}
