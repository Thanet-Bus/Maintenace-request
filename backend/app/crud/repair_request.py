from sqlalchemy.orm import Session

from app.model.repair_requests import RepairRequests
from app.schemas.repair_requests import RepairRequestCreate, RepairStatus, RepairRequestUpdate

def create_repair_request(
    db: Session,
    data: RepairRequestCreate,
    requester_id: int,
) -> RepairRequests:
    repair_request = RepairRequests(
        requester_id=requester_id,
        title=data.title,
        description=data.description,
        location=data.location,
        # appointment_date=data.date,
        status=RepairStatus.PENDING,
    )

    db.add(repair_request)
    db.commit()
    db.refresh(repair_request)

    return repair_request

def get_repair_requests(db: Session) -> list[RepairRequests]:
    return db.query(RepairRequests).order_by(
        RepairRequests.created_at.desc()
    ).all()

def get_repair_request_by_id(
    db: Session,
    id: int,
) -> RepairRequests | None:
    return db.query(RepairRequests).filter(
        RepairRequests.id == id
    ).first()

def update_repair_request(
    db: Session,
    repair_request: RepairRequests,
    data: RepairRequestUpdate,
) -> RepairRequests:
    update_data = data.model_dump(exclude_unset=True)
    allowed_fields = {
        "title",
        "description",
        "location",
        "date",
        "status",
    }

    for field, value in update_data.items():
        if field in allowed_fields:
            setattr(repair_request, field, value)

    db.commit()
    db.refresh(repair_request)

    return repair_request