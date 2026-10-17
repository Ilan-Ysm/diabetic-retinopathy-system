import type { Metadata } from 'next';
import { DR_GRADES, DR_LABELS } from '@/lib/types';
export const metadata: Metadata={title:'Справочник | Retinal Fundus Research'};
export default function GuidePage() {
  return <section className="max-w-3xl space-y-8"><h1 className="page-title">Справочник по степеням диабетической ретинопатии</h1><p className="text-muted">Ниже показана учебная пятиуровневая шкала, используемая во многих наборах данных для классификации изображений глазного дна. Наличие степени в каталоге означает разметку источника, а не вывод этой веб-системы.</p>
    <dl className="panel divide-y divide-line">{DR_GRADES.map(g=><div key={g} className="grid gap-2 p-5 sm:grid-cols-[5rem_1fr]"><dt className="text-lg font-semibold">Класс {g}</dt><dd>{DR_LABELS[g]}</dd></div>)}</dl>
    <p className="rounded-lg border border-line p-4 text-sm text-muted">Определение стадии ретинопатии и клинические решения должны выполнять квалифицированные специалисты. Это приложение — исследовательский прототип, не медицинское изделие.</p>
  </section>;
}
