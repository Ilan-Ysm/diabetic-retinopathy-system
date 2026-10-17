from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password

from .models import ROLE_ADMIN, ROLE_DOCTOR, User
from .schemas import UserCreate


def get_by_email(session: Session, email: str) -> User | None:
    return session.scalar(select(User).where(User.email == email.strip().lower()))


def create_user(session: Session, data: UserCreate, role: str = ROLE_DOCTOR) -> User:
    user = User(
        email=data.email,
        full_name=data.full_name,
        password_hash=hash_password(data.password),
        role=role,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def authenticate(session: Session, email: str, password: str) -> User | None:
    user = get_by_email(session, email)
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user


def list_users(session: Session) -> list[User]:
    return list(session.scalars(select(User).order_by(User.created_at, User.id)))


def count_admins(session: Session) -> int:
    return session.scalar(select(func.count()).select_from(User).where(User.role == ROLE_ADMIN))


def set_role(session: Session, user: User, role: str) -> User:
    user.role = role
    session.commit()
    session.refresh(user)
    return user
