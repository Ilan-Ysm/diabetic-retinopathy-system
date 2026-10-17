"""Placeholder for future trained and independently evaluated retinal DR classifier.

No brain-tumor model or invented DR predictions are shipped with this starter.
"""
from io import BytesIO
from PIL import Image, UnidentifiedImageError

class InvalidImageError(ValueError):
    pass

def validate_image(content: bytes) -> None:
    try:
        with Image.open(BytesIO(content)) as image:
            if image.format not in {"JPEG", "PNG"}:
                raise InvalidImageError("Only JPG and PNG images are supported")
            image.verify()
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        if isinstance(exc, InvalidImageError):
            raise
        raise InvalidImageError("Invalid or corrupt JPG/PNG image") from exc

# In a later research milestone, add an inference implementation and tests.
