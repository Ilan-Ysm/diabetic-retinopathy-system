import uuid
from pathlib import Path
from sqlalchemy import or_, select
from sqlalchemy.orm import Session
from app.core.config import settings
from app.modules.inference.service import validate_image
from app.modules.users.models import User
from .models import Scan
from .schemas import ScanCreate, ScanUpdate

def list_scans(session: Session, q: str | None = None, grade: int | None = None, limit: int = 20, offset: int = 0) -> list[Scan]:
    stmt = select(Scan).order_by(Scan.created_at.desc(), Scan.id.desc())
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(or_(Scan.title.ilike(pattern), Scan.dataset.ilike(pattern)))
    if grade is not None:
        stmt = stmt.where(Scan.ground_truth_grade == grade)
    return list(session.scalars(stmt.limit(limit).offset(offset)).unique())

def get_scan(session: Session, scan_id: int) -> Scan | None:
    return session.get(Scan, scan_id)

def can_edit(user: User, scan: Scan) -> bool:
    return user.is_admin or scan.owner_id == user.id

def create_scan(session: Session, data: ScanCreate, owner: User) -> Scan:
    scan = Scan(**data.model_dump(), owner_id=owner.id)
    session.add(scan)
    session.commit()
    session.refresh(scan)
    return scan

def create_scan_from_image(session: Session, filename: str, content: bytes, owner: User) -> Scan:
    validate_image(content)
    suffix = '.png' if content.startswith(b'\x89PNG') else '.jpg'
    stored_name = f"{uuid.uuid4().hex}{suffix}"
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    path = upload_dir / stored_name
    path.write_bytes(content)
    stem = Path(filename).stem.strip()
    scan = Scan(
        title=stem[:500] if len(stem) >= 3 else 'Fundus image',
        dataset='User upload (unlabeled)',
        ground_truth_grade=None,
        predicted_grade=None,
        confidence=None,
        file_name=stored_name,
        image_path=stored_name,
        owner_id=owner.id,
    )
    try:
        session.add(scan)
        session.commit()
        session.refresh(scan)
    except Exception:
        session.rollback()
        path.unlink(missing_ok=True)
        raise
    return scan

def update_scan(session: Session, scan: Scan, data: ScanUpdate) -> Scan:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(scan, field, value)
    session.commit()
    session.refresh(scan)
    return scan

def delete_scan(session: Session, scan: Scan) -> None:
    image_path = scan.image_path
    session.delete(scan)
    session.commit()
    if image_path:
        (Path(settings.upload_dir) / image_path).unlink(missing_ok=True)
