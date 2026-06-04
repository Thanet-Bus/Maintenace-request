from sqlalchemy.orm import Session
from app.model.reviews import RepairReview
from app.schemas.reviews import ReviewCreate

def create_review(db: Session, data: ReviewCreate) -> RepairReview:
    review = RepairReview(
        repair_request_id=data.repair_request_id,
        technician_id=data.technician_id,
        rating=data.rating,
        comment=data.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

def get_review_by_id(db: Session, review_id: int) -> RepairReview | None:
    return db.query(RepairReview).filter(RepairReview.id == review_id).first()

def get_reviews_by_request_id(db: Session, request_id: int, skip: int = 0, limit: int = 100) -> list[RepairReview]:
    return db.query(RepairReview).filter(RepairReview.repair_request_id == request_id).offset(skip).limit(limit).all()

def get_reviews_by_technician_id(db: Session, technician_id: int, skip: int = 0, limit: int = 100) -> list[RepairReview]:
    return db.query(RepairReview).filter(RepairReview.technician_id == technician_id).offset(skip).limit(limit).all()