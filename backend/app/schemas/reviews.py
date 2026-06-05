from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class ReviewBase(BaseModel):
    repair_request_id: int
    technician_id: int
    rating: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
