"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { FormState } from "@/lib/types";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
};

export function PredictForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  function showFile(file: File | undefined) {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = file ? URL.createObjectURL(file) : null;
    setPreview(file && urlRef.current ? { url: urlRef.current, name: file.name } : null);
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const files = event.dataTransfer.files;
    if (!files.length || !inputRef.current) return;
    inputRef.current.files = files;
    showFile(files[0]);
  }

  return (
    <form action={formAction} className="space-y-4">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-film text-center text-white outline-offset-4 focus-within:outline-2 focus-within:outline-primary ${
          dragging ? "ring-4 ring-teal" : ""
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={(event) => showFile(event.target.files?.[0])}
        />

        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.url}
              alt="Выбранный снимок"
              className="h-full w-full object-contain"
            />
            <span className="absolute inset-x-0 bottom-0 truncate bg-film/80 px-4 py-2 text-left text-sm">
              {preview.name}
            </span>
          </>
        ) : (
          <span className="px-8">
            <svg
              viewBox="0 0 120 120"
              aria-hidden="true"
              className="mx-auto mb-5 h-28 w-28 text-[#7fd6d6]"
              fill="none"
              stroke="currentColor"
            >
              <ellipse cx="60" cy="60" rx="38" ry="46" strokeWidth="1.5" />
              <ellipse cx="60" cy="60" rx="30" ry="38" strokeWidth="1" opacity="0.5" />
              <path d="M60 14v92" strokeWidth="1" opacity="0.7" />
              <path d="M8 60h14M98 60h14M60 2v6M60 112v6" strokeWidth="1.5" />
            </svg>
            <span className="block text-lg font-semibold">Выберите изображение глазного дна</span>
            <span className="mt-1 block text-sm text-white/70">
              или перетащите файл сюда. JPG или PNG, до 10 МБ
            </span>
          </span>
        )}
      </label>

      {state.error && (
        <p role="alert" className="rounded-[10px] bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <button disabled={pending} className="btn btn-primary w-full py-3 text-base">
        {pending ? "Загрузка…" : "Сохранить изображение"}
      </button>
    </form>
  );
}
