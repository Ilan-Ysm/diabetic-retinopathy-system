"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/types";

type Props = {
  action: () => Promise<FormState>;
  label: string;
};

export function RoleButton({ action, label }: Props) {
  const [state, formAction, pending] = useActionState<FormState>(() => action(), {});

  return (
    <form action={formAction} className="space-y-1">
      <button disabled={pending} className="btn btn-secondary px-3 py-1.5">
        {pending ? "Сохранение…" : label}
      </button>
      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
