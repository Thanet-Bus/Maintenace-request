from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.log import (
    get_logs,
    get_logs_by_request_id,
)
from app.crud.repair_request import get_repair_request_by_id
from app.schemas.logs import RepairLogResponse

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("", response_model=list[RepairLogResponse])
def list_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return get_logs(db, skip=skip, limit=limit)


@router.get("/request/{repair_request_id}", response_model=list[RepairLogResponse])
def list_logs_by_request(
    repair_request_id: int,
    db: Session = Depends(get_db)
):
    request = get_repair_request_by_id(db, repair_request_id)
    if request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repair request not found"
        )
    return get_logs_by_request_id(db, repair_request_id)