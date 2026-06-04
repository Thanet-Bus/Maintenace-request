from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.review import (
    create_review,
    get_reviews_by_request_id,
    get_reviews_by_technician_id,
)
from app.schemas.reviews import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_new_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
):
    return create_review(db, data)

@router.get("/request/{request_id}", response_model=list[ReviewResponse])
def list_reviews_by_request(
    request_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return get_reviews_by_request_id(db, request_id, skip, limit)

@router.get("/technician/{technician_id}", response_model=list[ReviewResponse])
def list_reviews_by_technician(
    technician_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return get_reviews_by_technician_id(db, technician_id, skip, limit)
