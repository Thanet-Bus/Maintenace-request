from app.api.database import Base
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

class Assignment(Base):
    __tablename__ = "assignments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    repair_request_id: Mapped[int] = mapped_column(ForeignKey("repair_requests.id"), nullable=False)
    technician_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    is_leader: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
