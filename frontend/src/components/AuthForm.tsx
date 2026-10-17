"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/lib/types";

type Field = {
  name: string;
  label: string;
  type: string;
  autoComplete: string;
  minLength?: number;
};

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  fields: Field[];
  submit: string;
  pendingLabel: string;
  footer: { text: string; href: string; link: string };
};

export function AuthForm({ action, fields, submit, pendingLabel, footer }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      {fields.map((field) => (
        <label key={field.name} className="block text-sm font-medium">
          {field.label}
          <input
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            minLength={field.minLength}
            defaultValue={field.type === "password" ? undefined : state.values?.[field.name]}
            required
            className="field text-base font-normal"
          />
        </label>
      ))}

      {state.error && (
        <p role="alert" className="rounded-[10px] bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <button disabled={pending} className="btn btn-primary w-full py-3 text-base">
        {pending ? pendingLabel : submit}
      </button>

      <p className="text-center text-sm text-muted">
        {footer.text}{" "}
        <Link href={footer.href} className="font-semibold text-primary hover:underline">
          {footer.link}
        </Link>
      </p>
    </form>
  );
}
