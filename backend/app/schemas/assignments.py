from datetime import datetime
from pydantic import BaseModel

class AssignmentCreate(BaseModel):
    repair_request_id: int
    technician_id: int
    is_leader: bool

class AssignmentResponse(BaseModel):
    id: int
    repair_request_id: int
    technician_id: int
    is_leader: bool
    assigned_at: datetime

    model_config = {
        "from_attributes": True
    }
