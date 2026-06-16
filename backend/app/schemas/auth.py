from datetime import datetime
from pydantic import BaseModel


class LineCallbackRequest(BaseModel):
    code: str
    invite_token: str | None = None


class TechnicianInviteResponse(BaseModel):
    token: str
    expires_in_seconds: int
    expires_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CurrentUserResponse(BaseModel):
    id: int
    line_user_id: str | None
    emp_id: str | None
    name: str | None
    profile_image_url: str | None
    role: str

    model_config = {
        "from_attributes": True
    }