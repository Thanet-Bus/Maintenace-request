from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from collections import defaultdict

from app.core.database import get_db
from app.crud.assignment import (
    create_assignments,
    get_assignments,
    get_assignment_by_request_and_tech,
    get_assignments_by_repair_request,
    get_assignments_by_technician,
    update_assignment_is_leader,
)
from app.schemas.assignments import AssignmentCreate, AssignmentResponse, TechnicianAssignmentDetail, AssignmentLeaderUpdate, AssignmentStatusResponse

router = APIRouter(prefix="/assignments", tags=["assignments"])

@router.post("", response_model=AssignmentResponse)
def assign_multiple_technicians(
    data: AssignmentCreate,
    db: Session = Depends(get_db),
):
    try:
        assignments = create_assignments(db, data)
        return AssignmentResponse(
            repair_request_id=data.repair_request_id,
            technicians=assignments
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=list[AssignmentResponse])
def list_all_assignments(db: Session = Depends(get_db)):
    assignments = get_assignments(db)
    
    grouped = defaultdict(list)
    for a in assignments:
        grouped[a.repair_request_id].append(a)
        
    return [
        AssignmentResponse(repair_request_id=req_id, technicians=techs)
        for req_id, techs in grouped.items()
    ]


@router.get(
    "/repair-request/{repair_request_id}",
    response_model=AssignmentResponse,
)
def list_assignments_by_repair_request(
    repair_request_id: int,
    db: Session = Depends(get_db),
):
    results = get_assignments_by_repair_request(db, repair_request_id)
    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found for this repair request",
        )
    technicians = [
        TechnicianAssignmentDetail(
            id=assignment.id,
            technician_id=assignment.technician_id,
            is_leader=assignment.is_leader,
            assigned_at=assignment.assigned_at,
            name=user.name,
            phone=user.phone,
            profile_image_url=user.profile_image_url,
        )
        for assignment, user in results
    ]
    return AssignmentResponse(
        repair_request_id=repair_request_id,
        technicians=technicians
    )


@router.get(
    "/technician/{technician_id}",
    response_model=list[AssignmentStatusResponse],
)
def list_assignments_by_technician(
    technician_id: int,
    db: Session = Depends(get_db),
):
    assignments = get_assignments_by_technician(db, technician_id)
    if not assignments:
        return []
    
    # Structure: dict[req_id, dict] => {"status": RepairStatus, "appointment_date": datetime, "technicians": list[Assignment]}
    grouped_data = {}
    for assignment, status_val, appointment_date in assignments:
        req_id = assignment.repair_request_id
        if req_id not in grouped_data:
            grouped_data[req_id] = {"status": status_val, "appointment_date": appointment_date, "technicians": []}
        grouped_data[req_id]["technicians"].append(assignment)

    return [
        AssignmentStatusResponse(
            repair_request_id=req_id, 
            status=data["status"],
            appointment_date=data["appointment_date"],
            technicians=data["technicians"]
        )
        for req_id, data in grouped_data.items()
    ]


@router.patch(
    "/repair-request/{repair_request_id}/leader/{technician_id}",
    response_model=TechnicianAssignmentDetail,
)
def set_team_leader(
    repair_request_id: int,
    technician_id: int,
    data: AssignmentLeaderUpdate,
    db: Session = Depends(get_db),
):
    assignment = get_assignment_by_request_and_tech(db, repair_request_id, technician_id)
    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found for this technician and repair request",
        )
    return update_assignment_is_leader(db, assignment, data.is_leader)
