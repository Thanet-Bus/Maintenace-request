from sqlalchemy.orm import Session
from app.model.logs import RepairLogs
from app.schemas.logs import RepairLogCreate
from app.crud.repair_request import get_repair_request_by_id

def create_log(db: Session, log: RepairLogCreate) -> RepairLogs:
    db_log = RepairLogs(
        repair_request_id=log.repair_request_id,
        changed_by=log.changed_by,
        status_to=log.status_to,
        note=log.note
    )
    db.add(db_log)
    
    repair_request = get_repair_request_by_id(db, log.repair_request_id)
    if repair_request:
        repair_request.status = log.status_to

    db.commit()
    db.refresh(db_log)
    return db_log

def get_logs(db: Session, skip: int = 0, limit: int = 100) -> list[RepairLogs]:
    return db.query(RepairLogs).offset(skip).limit(limit).all()

def get_logs_by_request_id(db: Session, repair_request_id: int) -> list[RepairLogs]:
    return db.query(RepairLogs).filter(RepairLogs.repair_request_id == repair_request_id).order_by(RepairLogs.created_at.desc()).all()