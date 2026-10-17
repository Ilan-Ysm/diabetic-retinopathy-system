"""Populate 30 clearly labeled *synthetic metadata* records (no actual medical images)."""
from sqlalchemy import select
from app.db import SessionLocal
from app.modules.scans.models import Scan

def main() -> None:
    with SessionLocal() as session:
        existing = set(session.scalars(select(Scan.title)))
        added = 0
        for n in range(1,31):
            title = f'DEMO-FUNDUS-{n:03d}'
            if title in existing:
                continue
            session.add(Scan(title=title, dataset='SYNTHETIC DEMO METADATA',
                             ground_truth_grade=None,
                             eye_side='left' if n % 2 else 'right',
                             description='Synthetic record only; no image or clinical label.'))
            added += 1
        session.commit()
    print(f'Added {added} synthetic metadata records')

if __name__ == '__main__':
    main()
