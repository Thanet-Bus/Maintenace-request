from datetime import datetime, timedelta, timezone

import jwt
from jwt import ExpiredSignatureError, InvalidTokenError

from app.core.config import settings


TECHNICIAN_INVITE_TOKEN_TYPE = "technician_invite"
TECHNICIAN_INVITE_TOKEN_MINUTES = 5


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_expire_minutes
    )

    payload = {
        "sub": str(user_id),
        "exp": expire,
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def create_technician_invite_token(created_by_user_id: int) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=TECHNICIAN_INVITE_TOKEN_MINUTES)

    payload = {
        "type": TECHNICIAN_INVITE_TOKEN_TYPE,
        "role": "TECH",
        "created_by": created_by_user_id,
        "iat": now,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except ExpiredSignatureError as error:
        raise ValueError("Token expired") from error
    except InvalidTokenError as error:
        raise ValueError("Invalid token") from error


def decode_technician_invite_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"require": ["type", "role", "created_by", "exp"]},
        )
    except ExpiredSignatureError as error:
        raise ValueError("Technician invite token expired") from error
    except InvalidTokenError as error:
        raise ValueError("Invalid technician invite token") from error
