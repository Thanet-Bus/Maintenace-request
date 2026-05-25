from datetime import datetime
from pydantic import BaseModel

class TechnicianAssignment(BaseModel):
    technician_id: int
    is_leader: bool = False

class AssignmentCreate(BaseModel):
    repair_request_id: int
    technicians: list[TechnicianAssignment]

class TechnicianAssignmentDetail(BaseModel):
    id: int
    technician_id: int
    is_leader: bool
    assigned_at: datetime

    model_config = {
        "from_attributes": True
    }

class AssignmentResponse(BaseModel):
    repair_request_id: int
    technicians: list[TechnicianAssignmentDetail]

class AssignmentLeaderUpdate(BaseModel):
    is_leader: bool
