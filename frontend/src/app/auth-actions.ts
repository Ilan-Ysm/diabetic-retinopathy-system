"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/api";
import { clearToken, saveToken } from "@/lib/session";
import type { FormState } from "@/lib/types";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const values = { email };
  if (!email || !password) return { error: "Введите почту и пароль.", values };

  const token = await auth.login(email, password);
  if (!token) return { error: "Неверная почта или пароль.", values };

  await saveToken(token);
  redirect("/");
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const repeat = String(formData.get("password_repeat") ?? "");
  const values = { full_name: fullName, email };

  if (fullName.length < 2) return { error: "Укажите имя и фамилию.", values };
  if (!EMAIL.test(email)) return { error: "Проверьте адрес почты.", values };
  if (password.length < 8) return { error: "Пароль должен быть не короче 8 символов.", values };
  if (password !== repeat) return { error: "Пароли не совпадают.", values };

  const status = await auth.register(email, fullName, password);
  if (status === 409) return { error: "Пользователь с такой почтой уже зарегистрирован.", values };
  if (status !== 201) return { error: "Не удалось зарегистрироваться. Проверьте данные.", values };

  const token = await auth.login(email, password);
  if (!token) redirect("/login");
  await saveToken(token);
  redirect("/");
}

export async function logoutAction() {
  await clearToken();
  redirect("/login");
}
