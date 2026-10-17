import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource-variable/golos-text";
import { NavLinks } from "@/components/NavLinks";
import { getCurrentUser } from "@/lib/session";
import { ROLE_LABELS } from "@/lib/types";
import { logoutAction } from "./auth-actions";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diabetic Retinopathy Research",
  description: "Каталог изображений глазного дна для исследования диабетической ретинопатии",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="ru">
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-line bg-surface">
          <nav
            aria-label="Основная навигация"
            className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-8"
          >
            <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
              <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
                <rect width="32" height="32" rx="9" fill="#060c11" />
                <ellipse
                  cx="16"
                  cy="16"
                  rx="9.5"
                  ry="11"
                  fill="none"
                  stroke="#7fd6d6"
                  strokeWidth="1.6"
                />
                <path d="M16 5v22" stroke="#7fd6d6" strokeWidth="1.2" />
                <circle cx="20.5" cy="13" r="2.4" fill="#ffffff" />
              </svg>
              Diabetic Retinopathy Research
            </Link>
            {user ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <NavLinks isAdmin={user.role === "admin"} />
                <div className="flex items-center gap-3 border-l border-line pl-4">
                  <span className="text-sm leading-tight">
                    <span className="block font-semibold">{user.full_name}</span>
                    <span className="block text-muted">{ROLE_LABELS[user.role]}</span>
                  </span>
                  <form action={logoutAction}>
                    <button className="btn btn-secondary px-3 py-2">Выйти</button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="btn btn-secondary px-3 py-2">
                  Войти
                </Link>
                <Link href="/register" className="btn btn-primary px-3 py-2">
                  Регистрация
                </Link>
              </div>
            )}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-12">
          {children}
        </main>

        <footer className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-5 text-sm text-muted sm:px-8">
            Исследовательский прототип для анализа изображений глазного дна. Нейросеть пока не подключена. Сервис не предназначен для постановки диагноза.
          </div>
        </footer>
      </body>
    </html>
  );
}
