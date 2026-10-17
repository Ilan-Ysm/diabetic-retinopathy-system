'use client';
import { useActionState } from 'react';
import { DR_GRADES, DR_LABELS, EYE_LABELS, EYE_SIDES } from '@/lib/types';
import type { FormState, Scan } from '@/lib/types';
type Props = { action: (prev: FormState, data: FormData) => Promise<FormState>; initial?: Scan };
export function ScanForm({ action, initial }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  return <form action={formAction} className="space-y-5">
    <label className="block text-sm font-medium">Название *
      <input className="field text-base font-normal" name="title" required minLength={3} defaultValue={initial?.title} />
    </label>
    <label className="block text-sm font-medium">Источник / датасет *
      <input className="field text-base font-normal" name="dataset" required minLength={2} defaultValue={initial?.dataset} />
    </label>
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="block text-sm font-medium">Подтверждённая степень ДР
        <select className="field text-base font-normal" name="ground_truth_grade" defaultValue={initial?.ground_truth_grade ?? ''}>
          <option value="">Не размечено</option>
          {DR_GRADES.map(g => <option key={g} value={g}>{g}: {DR_LABELS[g]}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium">Глаз
        <select className="field text-base font-normal" name="eye_side" defaultValue={initial?.eye_side ?? ''}>
          <option value="">Не указан</option>
          {EYE_SIDES.map(s => <option key={s} value={s}>{EYE_LABELS[s]}</option>)}
        </select>
      </label>
    </div>
    <label className="block text-sm font-medium">Имя файла (метаданные)
      <input className="field text-base font-normal" name="file_name" defaultValue={initial?.file_name ?? ''} />
    </label>
    <label className="block text-sm font-medium">Описание
      <textarea className="field text-base font-normal" name="description" rows={4} defaultValue={initial?.description ?? ''}/>
    </label>
    <p className="text-sm text-muted">Степень ДР здесь — метка из проверенного датасета или экспертной разметки, а не ответ нейросети.</p>
    {state.error && <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>}
    <button className="btn btn-primary" disabled={pending}>{pending ? 'Сохранение…' : 'Сохранить'}</button>
  </form>;
}
