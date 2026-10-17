import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/session";
import { loginAction } from "../auth-actions";

export const metadata: Metadata = { title: "Вход | Diabetic Retinopathy Research" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <section className="mx-auto max-w-md space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="page-title">Вход</h1>
        <p className="text-muted">Система доступна врачам и администраторам.</p>
      </header>
      <div className="panel p-6">
        <AuthForm
          action={loginAction}
          submit="Войти"
          pendingLabel="Вход…"
          fields={[
            { name: "email", label: "Почта", type: "email", autoComplete: "email" },
            {
              name: "password",
              label: "Пароль",
              type: "password",
              autoComplete: "current-password",
            },
          ]}
          footer={{ text: "Нет аккаунта?", href: "/register", link: "Зарегистрироваться" }}
        />
      </div>
    </section>
  );
}
