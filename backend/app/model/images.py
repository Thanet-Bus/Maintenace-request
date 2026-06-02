from app.core.database import Base
from datetime import datetime
from sqlalchemy import Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.model.status import RepairImageType, repair_image_type_enum

class RepairImages(Base):
    __tablename__ = "repair_images"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    repair_request_id: Mapped[int] = mapped_column(
        ForeignKey("repair_requests.id", ondelete="CASCADE"), 
        nullable=False
    )
    uploaded_by: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), 
        nullable=True
    )
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    #type of image: request, complete, onhold, signature, etc.
    image_type: Mapped[RepairImageType | None] = mapped_column(
        repair_image_type_enum,
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
