import type { ReactNode } from "react";
import Link from "next/link";
import "@/styles/tokens.css";
import "@/styles/animations.css";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4">
          <Link href="/" className="font-bold">Логотип</Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/studio" className="hover:text-primary transition-colors">Студия</Link>
            <Link href="/projects" className="hover:text-primary transition-colors">Проекты</Link>
            <Link href="/explore" className="hover:text-primary transition-colors">Галерея</Link>
            <Link href="/billing" className="hover:text-primary transition-colors">Биллинг</Link>
            <Link href="/settings" className="hover:text-primary transition-colors">Настройки</Link>
          </nav>
          {user ? (
            <div className="text-sm text-muted">
              План: {user.plan} • Токенов: {user.tokens}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted">
              <span>Гость</span>
              <Link href="/auth/sign-in" className="text-primary hover:underline">
                Войти
              </Link>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1280px] px-4 py-8">{children}</main>
    </div>
  );
}
