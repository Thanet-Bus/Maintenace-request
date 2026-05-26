from sqlalchemy.orm import Session

from app.model.repair_requests import RepairRequests
from app.model.logs import RepairLogs
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

def get_repair_requests_by_requester_id(
    db: Session,
    requester_id: int,
) -> list[RepairRequests]:
    return db.query(RepairRequests).filter(
        RepairRequests.requester_id == requester_id
    ).order_by(
        RepairRequests.created_at.desc()
    ).all()

def update_repair_request(
    db: Session,
    repair_request: RepairRequests,
    data: RepairRequestUpdate,
    user_id: int,
) -> RepairRequests:
    update_data = data.model_dump(exclude_unset=True)

    note = update_data.pop("note", None)
    status_changed = "status" in update_data

    for field, value in update_data.items():
        if hasattr(repair_request, field):
            setattr(repair_request, field, value)

    if status_changed or note is not None:
        log_entry = RepairLogs(
            repair_request_id=repair_request.id,
            changed_by=user_id,
            status_to=repair_request.status,
            note=note
        )
        db.add(log_entry)

    db.commit()
    db.refresh(repair_request)

    return repair_request