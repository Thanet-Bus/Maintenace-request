from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.repair_request import (
    create_repair_request,
    get_repair_requests,
    get_repair_request_by_id,
    get_repair_requests_by_requester_id,
    update_repair_request,
)
from app.schemas.repair_requests import (
    RepairRequestCreate,
    RepairRequestUpdate,
    RepairRequestResponse,
)

router = APIRouter(prefix="/repair-requests", tags=["repair requests"])

@router.post("", response_model=RepairRequestResponse)
def create_request(
    data: RepairRequestCreate,
    db: Session = Depends(get_db),
):
    return create_repair_request(db, data, requester_id=1)


@router.get("", response_model=list[RepairRequestResponse])
def list_requests(db: Session = Depends(get_db)):
    return get_repair_requests(db)


@router.get("/requester/{requester_id}", response_model=list[RepairRequestResponse])
def get_requests_by_requester(
    requester_id: int,
    db: Session = Depends(get_db),
):
    request = get_repair_requests_by_requester_id(db, requester_id)
    if request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requester not found",
        )
    return request


@router.get("/{repair_request_id}", response_model=RepairRequestResponse)
def get_request_by_id(
    repair_request_id: int,
    db: Session = Depends(get_db),
):
    request = get_repair_request_by_id(db, repair_request_id)
    if request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repair request not found",
        )
    return request


@router.patch(
    "/{repair_request_id}",
    response_model=RepairRequestResponse,
    status_code=status.HTTP_200_OK,
)
def update_request(
    repair_request_id: int,
    data: RepairRequestUpdate,
    db: Session = Depends(get_db),
):
    request = get_repair_request_by_id(db, repair_request_id)
    if request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repair request not found",
        )
    return update_repair_request(db, request, data, user_id=2)
