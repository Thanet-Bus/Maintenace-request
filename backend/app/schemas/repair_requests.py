from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from enum import Enum
from typing import Optional, Any

class RepairStatus(str, Enum):
    PENDING = "PENDING"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class RepairRequestCreate(BaseModel):
    title: str = Field(min_length=3,max_length=100, description="Repair request title")
    description: str = Field(max_length=1000, description="Repair request description")
    location: str = Field(min_length=1,max_length=255, description="Repair location")
    images: Optional[str] | None = Field(default=None, max_length=2000, description="Image URLs")

class RepairRequestUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3,max_length=100)
    description: Optional[str] = Field(default=None, max_length=1000)
    location: Optional[str] = Field(default=None, min_length=1,max_length=255)
    appointment_date: Optional[datetime] = Field(default=None)
    status: Optional[RepairStatus] = Field(default=None)

    @field_validator("appointment_date", mode="before")
    @classmethod
    def parse_empty_date(cls, v: Any):
        if v == "" or v is None:
            return None
        return v

'''backend respose'''
class RepairRequestResponse(BaseModel):
    id: int
    requester_id: int
    title: str
    description: str
    location: str
    status: RepairStatus
    appointment_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }