from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token
from app.crud.user import get_or_create_line_user
from app.schemas.auth import LineCallbackRequest, TokenResponse
from app.service.line_auth import exchange_code_for_token, verify_line_id_token


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/line/callback", response_model=TokenResponse)
async def line_callback(
    data: LineCallbackRequest,
    db: Session = Depends(get_db),
):
    try:
        token_data = await exchange_code_for_token(data.code)
        id_token = token_data["id_token"]

        line_profile = await verify_line_id_token(id_token)

        line_user_id = line_profile["sub"]
        display_name = line_profile.get("name")
        profile_image_url = line_profile.get("picture")

        user = get_or_create_line_user(
            db=db,
            line_user_id=line_user_id,
            display_name=display_name,
            profile_image_url=profile_image_url,
        )

        access_token = create_access_token(user.id)

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="LINE login failed",
        )