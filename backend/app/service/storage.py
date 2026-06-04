from pathlib import Path
from uuid import uuid4
from fastapi import UploadFile


UPLOAD_DIR = Path("uploads/images")


async def save_upload_file(
    file: UploadFile,
    repair_request_id: int,
    image_type: str,
) -> str:

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    file_extension = Path(file.filename or "").suffix.lower()

    while True:
        short_id = uuid4().hex[:16]
        filename = f"{repair_request_id}_{image_type}_{short_id}{file_extension}"
        file_path = UPLOAD_DIR / filename

        if not file_path.exists():
            break

    content = await file.read()
    file_path.write_bytes(content)

    return f"/uploads/images/{filename}"
