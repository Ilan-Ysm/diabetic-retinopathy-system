import Link from "next/link";

export default function NotFound() {
  return (
    <section className="panel max-w-xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Страница не найдена</h1>
      <p className="text-muted">Такой записи или страницы нет. Возможно, запись была удалена.</p>
      <Link href="/scans" className="btn btn-primary">
        Открыть каталог
      </Link>
    </section>
  );
}
