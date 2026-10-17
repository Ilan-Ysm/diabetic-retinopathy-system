from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db import get_session
from app.modules.inference.service import InvalidImageError
from app.modules.users.deps import get_current_user
from app.modules.users.models import User
from . import service
from .models import Scan
from .schemas import ScanCreate, ScanOut, ScanUpdate

router = APIRouter(prefix='/scans', tags=['scans'], dependencies=[Depends(get_current_user)])
MAX_UPLOAD_BYTES = 10 * 1024 * 1024

def get_or_404(scan_id: int, session: Session = Depends(get_session)) -> Scan:
    scan = service.get_scan(session, scan_id)
    if scan is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'Image record not found')
    return scan

def get_editable(scan: Scan = Depends(get_or_404), user: User = Depends(get_current_user)) -> Scan:
    if not service.can_edit(user, scan):
        raise HTTPException(403, 'Only the author or administrator may change this record')
    return scan

@router.get('', response_model=list[ScanOut])
def list_scans(q: str | None = Query(None, max_length=200), grade: int | None = Query(None, ge=0, le=4),
               limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0),
               session: Session = Depends(get_session)):
    return service.list_scans(session, q, grade, limit, offset)

# Exact/static routes MUST precede /{scan_id}
@router.post('/upload', response_model=ScanOut, status_code=201)
def upload_scan(file: UploadFile, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    content = file.file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, 'Image larger than 10 MB')
    try:
        return service.create_scan_from_image(session, file.filename or 'fundus.jpg', content, user)
    except InvalidImageError as exc:
        raise HTTPException(422, str(exc)) from exc

@router.get('/{scan_id}', response_model=ScanOut)
def read_scan(scan: Scan = Depends(get_or_404)):
    return scan

@router.get('/{scan_id}/image')
def read_scan_image(scan: Scan = Depends(get_or_404)):
    if not scan.image_path:
        raise HTTPException(404, 'Image not uploaded')
    file = Path(settings.upload_dir) / Path(scan.image_path).name
    if not file.is_file():
        raise HTTPException(404, 'Image file not found')
    return FileResponse(file, headers={'Cache-Control': 'private, no-store'})

@router.post('', response_model=ScanOut, status_code=status.HTTP_201_CREATED)
def create_scan(data: ScanCreate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    try:
        return service.create_scan(session, data, user)
    except IntegrityError:
        session.rollback()
        raise HTTPException(409, 'This filename already exists')

@router.patch('/{scan_id}', response_model=ScanOut)
def update_scan(data: ScanUpdate, scan: Scan = Depends(get_editable), session: Session = Depends(get_session)):
    try:
        return service.update_scan(session, scan, data)
    except IntegrityError:
        session.rollback()
        raise HTTPException(409, 'This filename already exists')

@router.delete('/{scan_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_scan(scan: Scan = Depends(get_editable), session: Session = Depends(get_session)):
    service.delete_scan(session, scan)
