from app.core.database import Base
from datetime import datetime
from sqlalchemy import Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.model.status import RepairStatus, repair_status_enum

class RepairLogs(Base):
    __tablename__ = "logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    repair_request_id: Mapped[int] = mapped_column(
        ForeignKey("repair_requests.id", ondelete="CASCADE"), 
        nullable=False
    )
    changed_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    status_to: Mapped[RepairStatus] = mapped_column(
        repair_status_enum, 
        nullable=False
    )
    
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
