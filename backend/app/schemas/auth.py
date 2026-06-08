from pydantic import BaseModel


class LineCallbackRequest(BaseModel):
    code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CurrentUserResponse(BaseModel):
    id: int
    line_user_id: str | None
    employee_number: str | None
    display_name: str | None
    profile_image_url: str | None
    role: str

    model_config = {
        "from_attributes": True
    }