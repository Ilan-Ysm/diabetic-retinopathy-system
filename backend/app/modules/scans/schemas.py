from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

Grade = Literal[0, 1, 2, 3, 4]
EyeSide = Literal["left", "right"]

class ScanBase(BaseModel):
    title: str = Field(min_length=3, max_length=500)
    dataset: str = Field(min_length=2, max_length=255)
    ground_truth_grade: Grade | None = None
    eye_side: EyeSide | None = None
    description: str | None = None
    file_name: str | None = Field(default=None, max_length=255)

class ScanCreate(ScanBase):
    pass

class ScanUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=500)
    dataset: str | None = Field(default=None, min_length=2, max_length=255)
    ground_truth_grade: Grade | None = None
    eye_side: EyeSide | None = None
    description: str | None = None
    file_name: str | None = Field(default=None, max_length=255)

class ScanOut(ScanBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    predicted_grade: Grade | None = None
    confidence: float | None = None
    image_path: str | None = None
    owner_id: int | None = None
    owner_name: str | None = None
    created_at: datetime
