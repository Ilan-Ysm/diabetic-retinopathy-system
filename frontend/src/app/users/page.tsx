import type { Metadata } from "next";
import { RoleButton } from "@/components/RoleButton";
import { api } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { ROLE_LABELS } from "@/lib/types";
import { changeRole } from "./actions";

export const metadata: Metadata = { title: "Пользователи | Diabetic Retinopathy Research" };

export default async function UsersPage() {
  const admin = await requireAdmin();
  const users = await api.users();

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="page-title">Пользователи</h1>
        <p className="text-muted">
          Врачи регистрируются сами. Администратор может назначить врача администратором или вернуть
          обычную роль.
        </p>
      </header>

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left">
          <thead className="text-sm text-muted">
            <tr className="border-b border-line">
              <th className="px-5 py-3 font-semibold">Имя</th>
              <th className="px-5 py-3 font-semibold">Почта</th>
              <th className="px-5 py-3 font-semibold">Роль</th>
              <th className="px-5 py-3 font-semibold">Зарегистрирован</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => {
              const nextRole = user.role === "admin" ? "doctor" : "admin";
              return (
                <tr key={user.id}>
                  <td className="px-5 py-3 font-semibold">
                    {user.full_name}
                    {user.id === admin.id && (
                      <span className="ml-2 text-sm font-normal text-muted">это вы</span>
                    )}
                  </td>
                  <td className="px-5 py-3 break-all">{user.email}</td>
                  <td className="px-5 py-3">{ROLE_LABELS[user.role]}</td>
                  <td className="px-5 py-3">
                    {new Date(user.created_at).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <RoleButton
                      action={changeRole.bind(null, user.id, nextRole)}
                      label={nextRole === "admin" ? "Сделать администратором" : "Сделать врачом"}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
