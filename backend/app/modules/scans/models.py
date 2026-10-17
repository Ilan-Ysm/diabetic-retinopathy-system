from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base
from app.modules.users.models import User

class Scan(Base):
    """Fundus image metadata; ground_truth_grade is never inferred from an ML prediction."""
    __tablename__ = "scans"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(500), index=True)
    dataset: Mapped[str] = mapped_column(String(255), index=True)
    ground_truth_grade: Mapped[int | None] = mapped_column(Integer, index=True)
    eye_side: Mapped[str | None] = mapped_column(String(10))
    description: Mapped[str | None] = mapped_column(Text)
    file_name: Mapped[str | None] = mapped_column(String(255), unique=True)
    predicted_grade: Mapped[int | None] = mapped_column(Integer)
    confidence: Mapped[float | None] = mapped_column(Float)
    image_path: Mapped[str | None] = mapped_column(String(255))
    owner_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    owner: Mapped[User | None] = relationship(lazy="joined")

    @property
    def owner_name(self) -> str | None:
        return self.owner.full_name if self.owner else None
