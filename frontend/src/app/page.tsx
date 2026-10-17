import Link from 'next/link';
import { PredictForm } from '@/components/PredictForm';
import { requireUser } from '@/lib/session';
import { uploadScan } from './scans/actions';
const STEPS = [
  ['Загрузка', 'Добавьте открытое или синтетическое JPG/PNG изображение глазного дна.'],
  ['Каталог', 'Снимок сохраняется без диагноза и доступен для описания и поиска.'],
  ['Исследование', 'Позднее подключим обученную и протестированную модель классификации ДР.'],
];
export default async function HomePage() {
  await requireUser();
  return <section className="grid gap-10 lg:grid-cols-[1fr_25rem]">
    <div className="space-y-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-teal">Research prototype · Stage 1</p>
      <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Анализ изображений глазного дна</h1>
      <p className="max-w-xl text-lg text-muted">Исследовательская веб-система для хранения и разметки изображений сетчатки при изучении методов выявления диабетической ретинопатии.</p>
      <div className="rounded-xl border border-line bg-surface p-4 text-sm">
        <strong>Сейчас доступно:</strong> загрузка и каталог изображений, поиск, редактирование и разметка. <strong>Нейросеть ещё не подключена.</strong> Сервис не устанавливает медицинский диагноз.
      </div>
      <ol className="space-y-4">{STEPS.map(([title, description],i) => <li key={title} className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-soft font-semibold text-teal">{i+1}</span><p><strong>{title}.</strong> <span className="text-muted">{description}</span></p></li>)}</ol>
      <Link href="/scans" className="btn btn-secondary inline-flex">Открыть каталог</Link>
    </div>
    <div className="panel h-fit p-5">
      <h2 className="mb-4 text-lg font-semibold">Загрузить снимок глазного дна</h2>
      <PredictForm action={uploadScan}/>
    </div>
  </section>;
}
