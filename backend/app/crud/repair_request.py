from sqlalchemy.orm import Session

from app.model.repair_requests import RepairRequests
from app.schemas.repair_requests import RepairRequestCreate, RepairStatus

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
        appointment_date=data.date,
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

def update_repair_request_status(
    db: Session,
    repair_request: RepairRequests,
    status: RepairStatus,
) -> RepairRequests:
    repair_request.status = status

    db.commit()
    db.refresh(repair_request)

    return repair_request