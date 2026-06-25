from sqlalchemy.orm import Session
from app.model.logs import RepairLogs
from app.model.users import User

def get_logs(db: Session, skip: int = 0, limit: int = 100) -> list[RepairLogs]:
    return db.query(RepairLogs).order_by(RepairLogs.created_at.desc()).offset(skip).limit(limit).all()

def get_logs_by_request_id(db: Session, repair_request_id: int) -> list[RepairLogs]:
    return db.query(RepairLogs).filter(RepairLogs.repair_request_id == repair_request_id).order_by(RepairLogs.created_at.desc()).all()


def get_logs_by_repair_requests(
    db: Session,
    repair_request_ids: list[int],
) -> list[tuple[RepairLogs, User]]:
    return (
        db.query(RepairLogs, User)
        .join(User, RepairLogs.changed_by == User.id)
        .filter(RepairLogs.repair_request_id.in_(repair_request_ids))
        .order_by(RepairLogs.created_at.desc())
        .all()
    )