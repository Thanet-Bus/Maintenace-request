from sqlalchemy.orm import Session

from app.model.assignments import Assignment
from app.schemas.assignments import AssignmentCreate

def create_assignment(
    db: Session,
    data: AssignmentCreate,
) -> Assignment:
    assignment = Assignment(
        repair_request_id=data.repair_request_id,
        technician_id=data.technician_id,
        is_leader=data.is_leader,
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return assignment

def get_assignments(db: Session) -> list[Assignment]:
    return db.query(Assignment).order_by(Assignment.assigned_at.desc()).all()

def get_assignment_by_id(
    db: Session,
    assignment_id: int,
) -> Assignment | None:
    return db.query(Assignment).filter(
        Assignment.id == assignment_id
    ).first()

def get_assignments_by_repair_request(
    db: Session,
    repair_request_id: int,
) -> list[Assignment]:
    return db.query(Assignment).filter(
        Assignment.repair_request_id == repair_request_id
    ).order_by(Assignment.assigned_at.desc()).all()

def get_assignments_by_technician(
    db: Session,
    technician_id: int,
) -> list[Assignment]:
    return db.query(Assignment).filter(
        Assignment.technician_id == technician_id
    ).order_by(Assignment.assigned_at.desc()).all()

def update_assignment_is_leader(
    db: Session,
    assignment: Assignment,
    is_leader: bool,
) -> Assignment:
    assignment.is_leader = is_leader

    db.commit()
    db.refresh(assignment)

    return assignment
