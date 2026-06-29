from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from io import BytesIO
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.model.repair_requests import RepairRequests
from app.model.status import RepairStatus
from app.crud.repair_request import get_repair_requests
from app.crud.assignment import get_assignments_by_repair_requests
from app.crud.log import get_logs_by_repair_requests

router = APIRouter(prefix="/exports", tags=["exports"])

EXCEL_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
MAX_EXPORT_ROWS = 10000
THAI_TZ = timezone(timedelta(hours=7))
UTC_TZ = timezone.utc


def to_thai(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC_TZ)
    return dt.astimezone(THAI_TZ).replace(tzinfo=None)


@router.get("/excel")
async def export_repair_requests(db: Session = Depends(get_db)):
    try:
        requests: List[RepairRequests] = (
            get_repair_requests(db)[:MAX_EXPORT_ROWS]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {e}")

    requests.sort(key=lambda r: r.id, reverse= False)
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
    log_counts: dict[int, int] = {}
    for log_entry, _ in log_rows:
        if log_entry.status_to == RepairStatus.COMPLETED:
            grouped_completed_at[log_entry.repair_request_id] = (
                to_thai(log_entry.created_at)
            )
        log_counts[log_entry.repair_request_id] = (
            log_counts.get(log_entry.repair_request_id, 0) + 1
        )

    wb = Workbook()
    ws = wb.active
    ws.title = "requests"
    ws.append([
        "id",
        "title",
        "created at",
        "assigned to",
        "status",
        "completed at",
        "logs count",
    ])

    for req in requests:
        ws.append([
            req.id,
            req.title,
            to_thai(req.created_at),
            ", ".join(grouped_assignments.get(req.id, [])) or "-",
            str(req.status),
            grouped_completed_at.get(req.id) or "-",
            log_counts.get(req.id, 0),
        ])

    ws2 = wb.create_sheet("logs")
    ws2.append(["request id", "no", "datetime", "actor", "action", "note"])

    logs_by_request: dict[int, list[tuple]] = {}
    for log_entry, user in log_rows:
        logs_by_request.setdefault(log_entry.repair_request_id, []).append((log_entry, user))

    for req_id in sorted(logs_by_request.keys()):
        for no, (log_entry, user) in enumerate(logs_by_request[req_id], start=1):
            note_text = log_entry.note or ""
            ws2.append([
                log_entry.repair_request_id,
                no,
                to_thai(log_entry.created_at),
                user.name,
                str(log_entry.status_to),
                note_text,
            ])

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type=EXCEL_MEDIA_TYPE,
        headers={"Content-Disposition": "attachment; filename=repair_requests.xlsx"},
    )
