from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    TECHNICIAN_INVITE_TOKEN_MINUTES,
    create_access_token,
    create_technician_invite_token,
    decode_technician_invite_token,
)
from app.core.dependencies import get_current_user, require_admin
from app.crud.user import get_or_create_line_user
from app.model.users import User, UserRole
from app.schemas.auth import LineCallbackRequest, TechnicianInviteResponse, TokenResponse, CurrentUserResponse
from app.service.line_auth import exchange_code_for_token, verify_line_id_token


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


def apply_technician_invite_token(
    db: Session,
    user: User,
    invite_token: str | None,
) -> None:
    if not invite_token:
        return

    try:
        payload = decode_technician_invite_token(invite_token)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    if payload.get("type") != "technician_invite" or payload.get("role") != UserRole.TECH.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid technician invite token",
        )

    if user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Technician invite cannot be applied to an admin user",
        )

    user.role = UserRole.TECH
    db.commit()
    db.refresh(user)


@router.post("/technician-invites", response_model=TechnicianInviteResponse)
def create_technician_invite(
    current_user: User = Depends(require_admin),
):
    return {
        "token": create_technician_invite_token(current_user.id),
        "expires_in_seconds": TECHNICIAN_INVITE_TOKEN_MINUTES * 60,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=TECHNICIAN_INVITE_TOKEN_MINUTES),
    }


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

        apply_technician_invite_token(db, user, data.invite_token)

        access_token = create_access_token(user.id)

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="LINE login failed",
        )

@router.get("/me", response_model=CurrentUserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user