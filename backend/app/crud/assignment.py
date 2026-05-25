from sqlalchemy.orm import Session

from app.model.assignments import Assignment
from app.schemas.assignments import AssignmentCreate

def create_assignments(
    db: Session,
    data: AssignmentCreate,
) -> list[Assignment]:
    # Clear existing assignments to prevent duplicates when updating the team
    db.query(Assignment).filter(
        Assignment.repair_request_id == data.repair_request_id
    ).delete()

    assignments = [
        Assignment(
            repair_request_id=data.repair_request_id,
            technician_id=tech.technician_id,
            is_leader=tech.is_leader,
        )
        for tech in data.technicians
    ]

    db.add_all(assignments)
    db.commit()
    
    for a in assignments:
        db.refresh(a)
        
    return assignments

def get_assignments(db: Session) -> list[Assignment]:
    return db.query(Assignment).order_by(Assignment.assigned_at.desc()).all()

def get_assignment_by_request_and_tech(
    db: Session,
    repair_request_id: int,
    technician_id: int,
) -> Assignment | None:
    return db.query(Assignment).filter(
        Assignment.repair_request_id == repair_request_id,
        Assignment.technician_id == technician_id
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
    # If we are making this person a leader, we must demote everyone else on this team
    if is_leader:
        db.query(Assignment).filter(
            Assignment.repair_request_id == assignment.repair_request_id,
            Assignment.id != assignment.id  # Don't demote the person we are trying to promote!
        ).update({"is_leader": False})

    # Set the target person's leader status
    assignment.is_leader = is_leader

    db.commit()
    db.refresh(assignment)

    return assignment
