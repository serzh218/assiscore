import type { ReactNode } from "react";
import Link from "next/link";
import "@/styles/tokens.css";

export default function AppLayout({ children }: { children: ReactNode }) {
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
          <div className="text-sm text-muted">Баланс токенов: ХХХ</div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1280px] px-4 py-8">{children}</main>
    </div>
  );
}
