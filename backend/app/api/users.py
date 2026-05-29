from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.user import (
    create_user,
    get_user_by_id,
    get_user_by_line_id,
    get_user_by_emp_id,
    get_users,
    get_technicians,
    update_user,
)
from app.schemas.user import UserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])

@router.post("", response_model=UserResponse)
def create_new_user(
    data: UserCreate,
    db: Session = Depends(get_db),
):
    return create_user(db, data)

@router.get("", response_model=list[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return get_users(db, skip, limit)

@router.get("/technicians", response_model=list[UserResponse])
def list_technicians(db: Session = Depends(get_db)):
    return get_technicians(db)

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
):
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user

@router.get("/line/{line_user_id}", response_model=UserResponse)
def get_user_by_line(
    line_user_id: str,
    db: Session = Depends(get_db),
):
    user = get_user_by_line_id(db, line_user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user

@router.patch("/{user_id}", response_model=UserResponse)
def update_existing_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
):
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return update_user(db, user, data)