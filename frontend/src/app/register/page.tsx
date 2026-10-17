import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/session";
import { registerAction } from "../auth-actions";

export const metadata: Metadata = { title: "Регистрация | Diabetic Retinopathy Research" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <section className="mx-auto max-w-md space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="page-title">Регистрация врача</h1>
        <p className="text-muted">
          После регистрации вы сможете загружать снимки и вести свои записи в каталоге.
        </p>
      </header>
      <div className="panel p-6">
        <AuthForm
          action={registerAction}
          submit="Зарегистрироваться"
          pendingLabel="Регистрация…"
          fields={[
            { name: "full_name", label: "Имя и фамилия", type: "text", autoComplete: "name" },
            { name: "email", label: "Почта", type: "email", autoComplete: "email" },
            {
              name: "password",
              label: "Пароль, не короче 8 символов",
              type: "password",
              autoComplete: "new-password",
              minLength: 8,
            },
            {
              name: "password_repeat",
              label: "Повторите пароль",
              type: "password",
              autoComplete: "new-password",
              minLength: 8,
            },
          ]}
          footer={{ text: "Уже есть аккаунт?", href: "/login", link: "Войти" }}
        />
      </div>
    </section>
  );
}
