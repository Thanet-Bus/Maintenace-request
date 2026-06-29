from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional
from app.model.users import UserRole

class UserCreate(BaseModel):
    line_user_id: str = Field(max_length=255, description="LINE user ID")
    name: str = Field(max_length=255, description="User name")
    emp_id: str = Field(max_length=50, description="Employee ID")
    phone: Optional[str] = Field(default=None, max_length=20, description="Phone number")
    profile_image_url: Optional[str] = Field(default=None, description="Profile image URL")

class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=255)
    emp_id: Optional[str] = Field(default=None, max_length=50)
    phone: Optional[str] = Field(default=None, max_length=20)
    profile_image_url: Optional[str] = Field(default=None)
    role: Optional[UserRole] = Field(default=None)

class UserResponse(BaseModel):
    id: int
    line_user_id: str
    name: str
    emp_id: str
    phone: Optional[str] = None
    profile_image_url: Optional[str] = None
    role: UserRole
    created_at: datetime

    model_config = {
        "from_attributes": True
    }