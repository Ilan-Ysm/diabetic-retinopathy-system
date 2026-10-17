import Link from 'next/link';
import { GradeChip } from '@/components/GradeChip';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/session';
import { DR_GRADES, DR_LABELS } from '@/lib/types';
const PAGE_SIZE = 20;
export default async function ScansPage({ searchParams }: {
  searchParams: Promise<{ q?: string; grade?: string; page?: string }>;
}) {
  await requireUser();
  const { q, grade, page } = await searchParams;
  const current = Math.max(1,Number(page) || 1);
  const items = await api.list(q,grade,current,PAGE_SIZE);
  const filtered = Boolean(q || grade);
  const link = (p:number) => `/scans?${new URLSearchParams({ ...(q?{q}:{}), ...(grade?{grade}:{}),page:String(p) })}`;
  return <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="page-title">Каталог изображений глазного дна</h1><Link href="/scans/new" className="btn btn-secondary">Добавить метаданные</Link></div>
    <form className="panel flex flex-col gap-3 p-3 sm:flex-row">
      <input className="field mt-0 flex-1" name="q" aria-label="Поиск по названию или датасету" defaultValue={q} placeholder="Название или датасет" />
      <select className="field mt-0 sm:w-64" name="grade" aria-label="Подтверждённая степень ретинопатии" defaultValue={grade ?? ''}>
        <option value="">Любая степень ДР</option>{DR_GRADES.map(g=><option key={g} value={g}>{g}: {DR_LABELS[g]}</option>)}
      </select><button className="btn btn-primary">Найти</button>
    </form>
    {items.length === 0 ? <div className="panel space-y-2 p-8 text-center"><p className="text-lg font-semibold">{filtered?'Совпадений не найдено':'Каталог пока пуст'}</p><Link href={filtered?'/scans':'/'} className="btn btn-secondary inline-flex">{filtered?'Сбросить фильтры':'Загрузить изображение'}</Link></div>
    : <ul className="panel divide-y divide-line overflow-hidden">{items.map(s=><li key={s.id}><Link href={`/scans/${s.id}`} className="grid items-center gap-3 px-4 py-4 transition-colors hover:bg-canvas sm:grid-cols-[1fr_auto]"><span><strong className="block truncate">{s.title}</strong><span className="text-sm text-muted">{s.dataset}</span></span><GradeChip grade={s.ground_truth_grade}/></Link></li>)}</ul>}
    <div className="flex items-center justify-between">{current>1?<Link href={link(current-1)} className="btn btn-secondary">Назад</Link>:<span/>}<span className="text-sm text-muted">Страница {current}</span>{items.length===PAGE_SIZE?<Link href={link(current+1)} className="btn btn-secondary">Далее</Link>:<span/>}</div>
  </section>;
}
