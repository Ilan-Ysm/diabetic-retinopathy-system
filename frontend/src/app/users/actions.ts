"use server";

import { revalidatePath } from "next/cache";
import { ApiError, api } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import type { FormState, Role } from "@/lib/types";

export async function changeRole(userId: number, role: Role): Promise<FormState> {
  await requireAdmin();
  try {
    await api.setRole(userId, role);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return { error: "В системе должен остаться хотя бы один администратор." };
    }
    return { error: "Не удалось изменить роль." };
  }
  revalidatePath("/users");
  return {};
}
