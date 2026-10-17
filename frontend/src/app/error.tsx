"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="panel max-w-xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Не удалось получить данные</h1>
      <p className="text-muted">
        Сервер API не ответил. Проверьте, что он запущен, и повторите запрос.
      </p>
      <button onClick={reset} className="btn btn-primary">
        Повторить запрос
      </button>
    </section>
  );
}
