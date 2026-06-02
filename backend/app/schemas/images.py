from datetime import datetime
from pydantic import BaseModel
from app.model.status import RepairImageType

class RepairImageBase(BaseModel):
    image_url: str
    image_type: RepairImageType | None = None

class RepairImageCreate(RepairImageBase):
    repair_request_id: int
    uploaded_by: int | None = None

class RepairImageResponse(RepairImageBase):
    id: int
    repair_request_id: int
    uploaded_by: int | None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
