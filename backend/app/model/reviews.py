from app.core.database import Base
from datetime import datetime
from sqlalchemy import Text, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column

class RepairReview(Base):
    __tablename__ = "repair_reviews"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    repair_request_id: Mapped[int] = mapped_column(ForeignKey("repair_requests.id"), nullable=False)
    technician_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False)
