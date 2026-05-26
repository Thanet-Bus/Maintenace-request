from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from app.schemas.repair_requests import RepairStatus

class RepairLogCreate(BaseModel):
    repair_request_id: int
    changed_by: int
    status_to: RepairStatus
    note: Optional[str] = None

class RepairLogResponse(BaseModel):
    id: int
    repair_request_id: int
    changed_by: int
    status_to: RepairStatus
    note: Optional[str] = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }