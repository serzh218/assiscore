'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Input, Button } from '@/components/ui';
import { Toaster, toast } from 'sonner';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      toast.error('Неверная почта или пароль.');
    } else {
      router.push('/studio');
    }
  };

  return (
    <div className="mx-auto max-w-sm p-4">
      <h1 className="mb-4 text-xl font-semibold">Войти в аккаунт</h1>
      <form onSubmit={onSubmit} className="space-y-4">
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
        <Button type="submit">Войти</Button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/auth/sign-up" className="text-primary hover:underline">
          Создать аккаунт
        </Link>
      </p>
      <Toaster />
    </div>
  );
}
