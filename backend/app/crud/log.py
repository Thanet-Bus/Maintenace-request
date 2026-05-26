from sqlalchemy.orm import Session
from app.model.logs import RepairLogs

def get_logs(db: Session, skip: int = 0, limit: int = 100) -> list[RepairLogs]:
    return db.query(RepairLogs).order_by(RepairLogs.created_at.desc()).offset(skip).limit(limit).all()

def get_logs_by_request_id(db: Session, repair_request_id: int) -> list[RepairLogs]:
    return db.query(RepairLogs).filter(RepairLogs.repair_request_id == repair_request_id).order_by(RepairLogs.created_at.desc()).all()