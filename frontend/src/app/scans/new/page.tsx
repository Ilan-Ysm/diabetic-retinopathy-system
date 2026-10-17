import Link from 'next/link';
import { ScanForm } from '@/components/ScanForm';
import { requireUser } from '@/lib/session';
import { createScan } from '../actions';
export default async function NewScanPage() {
  await requireUser();
  return <section className="max-w-2xl space-y-6"><Link href="/scans" className="font-semibold text-primary hover:underline">← Каталог</Link><h1 className="page-title">Добавить запись</h1><p className="text-muted">Для каталогизации открытых данных или синтетических демонстрационных записей. Метка степени ДР заполняется только при наличии достоверной разметки.</p><div className="panel p-5"><ScanForm action={createScan}/></div></section>;
}
