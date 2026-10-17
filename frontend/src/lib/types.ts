export const DR_GRADES = [0, 1, 2, 3, 4] as const;
export type DRGrade = (typeof DR_GRADES)[number];
export const DR_LABELS: Record<DRGrade, string> = {
  0: 'Нет признаков ДР',
  1: 'Лёгкая НПДР',
  2: 'Умеренная НПДР',
  3: 'Тяжёлая НПДР',
  4: 'Пролиферативная ДР',
};
export const EYE_SIDES = ['left', 'right'] as const;
export type EyeSide = (typeof EYE_SIDES)[number];
export const EYE_LABELS: Record<EyeSide, string> = { left: 'Левый', right: 'Правый' };
export type Scan = {
  id: number;
  title: string;
  dataset: string;
  ground_truth_grade: DRGrade | null;
  eye_side: EyeSide | null;
  description: string | null;
  file_name: string | null;
  predicted_grade: DRGrade | null;
  confidence: number | null;
  image_path: string | null;
  owner_id: number | null;
  owner_name: string | null;
  created_at: string;
};
export type ScanInput = Pick<Scan, 'title' | 'dataset' | 'ground_truth_grade' | 'eye_side' | 'description' | 'file_name'>;
export type Role = 'doctor' | 'admin';
export const ROLE_LABELS: Record<Role, string> = { doctor: 'Исследователь', admin: 'Администратор' };
export type User = { id: number; email: string; full_name: string; role: Role; created_at: string };
export type FormState = { error?: string; values?: Record<string, string> };
