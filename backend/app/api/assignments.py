from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.assignment import (
    create_assignment,
    get_assignments,
    get_assignment_by_id,
    get_assignments_by_repair_request,
    get_assignments_by_technician,
    update_assignment_is_leader,
)
from app.schemas.assignments import AssignmentCreate, AssignmentResponse

router = APIRouter(prefix="/assignments", tags=["assignments"])

@router.post("", response_model=AssignmentResponse)
def create_assignment_route(
    data: AssignmentCreate,
    db: Session = Depends(get_db),
):
    return create_assignment(db, data)


@router.get("", response_model=list[AssignmentResponse])
def list_all_assignments(db: Session = Depends(get_db)):
    return get_assignments(db)


@router.get(
    "/repair-request/{repair_request_id}",
    response_model=list[AssignmentResponse],
)
def list_assignments_by_repair_request(
    repair_request_id: int,
    db: Session = Depends(get_db),
):
    return get_assignments_by_repair_request(db, repair_request_id)


@router.get(
    "/technician/{technician_id}",
    response_model=list[AssignmentResponse],
)
def list_assignments_by_technician(
    technician_id: int,
    db: Session = Depends(get_db),
):
    return get_assignments_by_technician(db, technician_id)


@router.patch(
    "/leader/{assignment_id}",
    response_model=AssignmentResponse,
)
def set_team_leader(
    assignment_id: int,
    is_leader: bool,
    db: Session = Depends(get_db),
):
    assignment = get_assignment_by_id(db, assignment_id)
    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found",
        )
    return update_assignment_is_leader(db, assignment, is_leader)
