import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GradeChip } from '@/components/GradeChip';
import { ScanForm } from '@/components/ScanForm';
import { api } from '@/lib/api';
import { canEdit, requireUser } from '@/lib/session';
import { DR_LABELS, EYE_LABELS } from '@/lib/types';
import { deleteScan, updateScan } from '../actions';
export default async function ScanPage({ params }: { params:Promise<{id:string}> }) {
  const user = await requireUser();
  const {id}= await params; const scanId=Number(id);
  if(!Number.isInteger(scanId)) notFound();
  const scan=await api.get(scanId); if(!scan) notFound();
  const editable=canEdit(user,scan.owner_id);
  return <article className="space-y-6">
    <Link href="/scans" className="font-semibold text-primary hover:underline">← Каталог</Link>
    <header className="space-y-3"><h1 className="page-title">{scan.title}</h1><GradeChip grade={scan.ground_truth_grade}/></header>
    <div className={`grid gap-6 ${scan.image_path?'lg:grid-cols-[24rem_1fr]':''}`}>
      {scan.image_path && <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-film">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/media/${scan.id}`} alt={`Изображение глазного дна ${scan.title}`} className="h-full w-full object-contain" />
      </div>}
      <div className="space-y-5">
        <section className="panel p-5"><h2 className="mb-3 font-semibold">Информация об изображении</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div><dt className="text-sm text-muted">Датасет</dt><dd>{scan.dataset}</dd></div>
            <div><dt className="text-sm text-muted">Глаз</dt><dd>{scan.eye_side?EYE_LABELS[scan.eye_side]:'Не указан'}</dd></div>
            <div><dt className="text-sm text-muted">Разметка</dt><dd>{scan.ground_truth_grade===null?'Отсутствует':DR_LABELS[scan.ground_truth_grade]}</dd></div>
            <div><dt className="text-sm text-muted">Результат ИИ</dt><dd>{scan.predicted_grade===null?'Модель ещё не подключена':DR_LABELS[scan.predicted_grade]}</dd></div>
            <div><dt className="text-sm text-muted">Имя файла</dt><dd className="break-all">{scan.file_name??'Не указано'}</dd></div>
            <div><dt className="text-sm text-muted">Автор</dt><dd>{scan.owner_name??'Синтетические данные'}</dd></div>
            <div><dt className="text-sm text-muted">Добавлено</dt><dd>{new Date(scan.created_at).toLocaleDateString('ru-RU')}</dd></div>
            {scan.description && <div className="sm:col-span-2"><dt className="text-sm text-muted">Описание</dt><dd className="whitespace-pre-line">{scan.description}</dd></div>}
          </dl>
        </section>
        <p className="text-sm text-muted">Прототип только для исследования. Не используйте результаты для медицинских решений.</p>
      </div>
    </div>
    {editable?<><details className="panel p-5"><summary className="cursor-pointer font-semibold">Редактировать</summary><div className="mt-5 max-w-2xl"><ScanForm initial={scan} action={updateScan.bind(null,scan.id)}/></div></details><form action={deleteScan.bind(null,scan.id)}><button className="btn btn-danger">Удалить запись</button></form></>:<p className="text-sm text-muted">Изменение доступно только автору или администратору.</p>}
  </article>;
}
