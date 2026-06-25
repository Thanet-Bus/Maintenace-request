from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from io import BytesIO
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.model.repair_requests import RepairRequests
from app.model.status import RepairStatus
from app.crud.repair_request import get_repair_requests
from app.crud.assignment import get_assignments_by_repair_requests
from app.crud.log import get_logs_by_repair_requests

router = APIRouter(prefix="/exports", tags=["exports"])

EXCEL_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
MAX_EXPORT_ROWS = 10000


@router.get("/excel")
async def export_repair_requests(db: Session = Depends(get_db)):
    try:
        requests: List[RepairRequests] = (
            get_repair_requests(db)[:MAX_EXPORT_ROWS]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {e}")

    request_ids = [r.id for r in requests]

    assignment_rows = (
        get_assignments_by_repair_requests(db, request_ids)
        if request_ids
        else []
    )
    
    log_rows = (
        get_logs_by_repair_requests(db, request_ids)
        if request_ids
        else []
    )

    grouped_assignments: dict[int, list[str]] = {}
    for assignment, user in assignment_rows:
        grouped_assignments.setdefault(assignment.repair_request_id, [])
        label = user.name
        if assignment.is_leader:
            label += " (Leader)"
        grouped_assignments[assignment.repair_request_id].append(label)

    grouped_completed_at: dict[int, datetime] = {}
    grouped_logs: dict[int, list[str]] = {}
    for log_entry, user in log_rows:
        if log_entry.status_to == RepairStatus.COMPLETED:
            grouped_completed_at[log_entry.repair_request_id] = (
                log_entry.created_at.replace(tzinfo=None)
            )
        grouped_logs.setdefault(log_entry.repair_request_id, [])
        note_text = f" - {log_entry.note}" if log_entry.note else ""
        grouped_logs[log_entry.repair_request_id].append(
            f"{log_entry.created_at.replace(tzinfo=None).isoformat()} "
            f"{user.name} -> {log_entry.status_to}{note_text}"
        )

    wb = Workbook()
    ws = wb.active
    ws.title = "Repair Requests"
    ws.append([
        "ID",
        "Title",
        "Status",
        "Requester",
        "Created At",
        "Assigned To",
        "Completed At",
        "Logs",
    ])

    for req in requests:
        ws.append([
            req.id,
            req.title,
            req.status,
            req.requester.name,
            req.created_at.replace(tzinfo=None),
            ", ".join(grouped_assignments.get(req.id, [])) or "-",
            grouped_completed_at.get(req.id) or "-",
            "; ".join(grouped_logs.get(req.id, [])) or "-",
        ])

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type=EXCEL_MEDIA_TYPE,
        headers={"Content-Disposition": "attachment; filename=repair_requests.xlsx"},
    )
