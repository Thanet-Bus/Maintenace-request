from datetime import datetime
from pydantic import BaseModel
from app.model.status import RepairStatus

class TechnicianAssignment(BaseModel):
    technician_id: int
    is_leader: bool = False

class AssignmentCreate(BaseModel):
    repair_request_id: int
    appointment_date: datetime
    technicians: list[TechnicianAssignment]
    note: str | None = None

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

class AssignmentStatusResponse(BaseModel):
    repair_request_id: int
    status: RepairStatus
    technicians: list[TechnicianAssignmentDetail]