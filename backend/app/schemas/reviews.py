from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class ReviewBase(BaseModel):
    id: int
    repair_request_id: int
    technician_id: int
    rating: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
