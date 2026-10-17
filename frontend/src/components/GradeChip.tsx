import { DR_LABELS } from '@/lib/types';
import type { DRGrade } from '@/lib/types';
const STYLES: Record<DRGrade, string> = {
  0: 'bg-[#dff3f2] text-[#0a6b6b]',
  1: 'bg-[#e3eef9] text-[#0b4f82]',
  2: 'bg-[#fff0d5] text-[#946200]',
  3: 'bg-[#fbe7dd] text-[#a34422]',
  4: 'bg-[#fce4e4] text-[#a32130]',
};
export function GradeChip({ grade }: { grade: DRGrade | null }) {
  if (grade === null) return <span className="text-sm text-muted">Без подтверждённой разметки</span>;
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[grade]}`}>
    {grade}: {DR_LABELS[grade]}
  </span>;
}
