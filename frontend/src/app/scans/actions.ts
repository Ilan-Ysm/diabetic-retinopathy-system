'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { DR_GRADES, EYE_SIDES } from '@/lib/types';
import type { DRGrade, EyeSide, FormState, ScanInput } from '@/lib/types';
const MAX_FILE_BYTES = 10 * 1024 * 1024;
function parseForm(data: FormData): ScanInput | null {
  const text = (name: string) => String(data.get(name) ?? '').trim();
  const title = text('title');
  const dataset = text('dataset');
  const gradeText = text('ground_truth_grade');
  const side = text('eye_side');
  if (title.length < 3 || dataset.length < 2) return null;
  if (gradeText !== '' && !DR_GRADES.includes(Number(gradeText) as DRGrade)) return null;
  if (side && !EYE_SIDES.includes(side as EyeSide)) return null;
  return { title, dataset, ground_truth_grade: gradeText === '' ? null : Number(gradeText) as DRGrade,
    eye_side: (side as EyeSide) || null, description: text('description') || null,
    file_name: text('file_name') || null };
}
export async function createScan(_prev: FormState, formData: FormData): Promise<FormState> {
  const data = parseForm(formData);
  if (!data) return { error: 'Проверьте название, датасет и степень ДР.' };
  let id: number;
  try { id = (await api.create(data)).id; }
  catch { return { error: 'Не удалось сохранить. Возможно, имя файла уже занято.' }; }
  revalidatePath('/scans');
  redirect(`/scans/${id}`);
}
export async function uploadScan(_prev: FormState, formData: FormData): Promise<FormState> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'Выберите изображение глазного дна.' };
  if (file.size > MAX_FILE_BYTES) return { error: 'Максимальный размер файла — 10 МБ.' };
  let id: number;
  try { id = (await api.upload(file)).id; }
  catch { return { error: 'Не удалось загрузить. Нужен корректный JPG или PNG.' }; }
  revalidatePath('/scans');
  redirect(`/scans/${id}`);
}
export async function updateScan(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const data = parseForm(formData);
  if (!data) return { error: 'Проверьте данные формы.' };
  try { await api.update(id, data); }
  catch (error) {
    if (error instanceof ApiError && error.status === 403) return { error: 'Изменять запись может только автор или администратор.' };
    return { error: 'Не удалось изменить запись.' };
  }
  revalidatePath('/scans');
  redirect(`/scans/${id}`);
}
export async function deleteScan(id: number) {
  await api.remove(id);
  revalidatePath('/scans');
  redirect('/scans');
}
