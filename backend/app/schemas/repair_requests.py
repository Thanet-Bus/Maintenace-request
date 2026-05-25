from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum

class RepairStatus(str, Enum):
    PENDING = "PENDING"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class RepairRequestCreate(BaseModel):
    title: str = Field(min_length=3,max_length=100, description="Repair request title")
    description: str = Field(max_length=1000, description="Repair request description")
    location: str = Field(min_length=1,max_length=255, description="Repair location")
    images: str | None = Field(default=None, max_length=2000, description="Image URLs")

class RepairRequestUpdate(BaseModel):
    title: str = Field(min_length=3,max_length=100, description="Repair request title")
    description: str = Field(max_length=1000, description="Repair request description")
    location: str = Field(min_length=1,max_length=255, description="Repair location")
    date: datetime | None = Field(default=None, description="Appointment date/datetime (ISO 8601 format)")
    status: RepairStatus

'''backend respose'''
class RepairRequestResponse(BaseModel):
    id: int
    requester_id: int
    title: str
    description: str
    location: str
    status: RepairStatus
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }