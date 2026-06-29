from sqlalchemy.orm import Session
from app.model.images import RepairImages
from app.model.users import User
from app.schemas.images import RepairImageCreate


def create_image(db: Session, image_data: RepairImageCreate) -> RepairImages:
    db_image = RepairImages(**image_data.model_dump())
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image


def get_image(db: Session, image_id: int) -> RepairImages | None:
    return db.query(RepairImages).filter(RepairImages.id == image_id).first()


def get_images_by_repair_request(
    db: Session, repair_request_id: int
) -> list[RepairImages]:
    return (
        db.query(RepairImages)
        .filter(RepairImages.repair_request_id == repair_request_id)
        .order_by(RepairImages.created_at.asc())
        .all()
    )


def get_images_by_repair_requests(
    db: Session,
    repair_request_ids: list[int],
) -> list[tuple[RepairImages, User | None]]:
    return (
        db.query(RepairImages, User)
        .outerjoin(User, RepairImages.uploaded_by == User.id)
        .filter(RepairImages.repair_request_id.in_(repair_request_ids))
        .order_by(RepairImages.created_at.asc())
        .all()
    )