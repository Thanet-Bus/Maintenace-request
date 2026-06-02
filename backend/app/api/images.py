from fastapi import APIRouter, Depends, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.image import (
    create_image,
    get_images_by_repair_request,
)
from app.schemas.images import RepairImageCreate, RepairImageResponse
from app.service.storage import save_upload_file
from app.model.status import RepairImageType

router = APIRouter(prefix="/repair-images", tags=["repair_images"])


@router.post(
    "", response_model=RepairImageResponse, status_code=status.HTTP_201_CREATED
)
async def add_repair_image(
    repair_request_id: int = Form(...),
    image_type: RepairImageType | None = Form(None),
    uploaded_by: int | None = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload an image file and save its record to the database.
    """
    image_url = await save_upload_file(
        file, repair_request_id, image_type.value if image_type else "OTHER"
    )

    image_data = RepairImageCreate(
        repair_request_id=repair_request_id,
        uploaded_by=uploaded_by,
        image_url=image_url,
        image_type=image_type,
    )
    return create_image(db, image_data)


@router.get(
    "/repair-request/{repair_request_id}", response_model=list[RepairImageResponse]
)
def read_images_for_request(
    repair_request_id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieve all images associated with a specific repair request.
    """
    return get_images_by_repair_request(db, repair_request_id)
