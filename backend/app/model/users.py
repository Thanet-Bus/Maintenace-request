from app.core.database import Base
from datetime import datetime
from enum import Enum
from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum as SQLEnum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    TECH = "TECH"
    USER = "USER"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    line_user_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    emp_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    profile_image_url: Mapped[str] = mapped_column(Text, nullable=True)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole), 
        default=UserRole.USER, 
        nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(), 
        nullable=False)

    repair_requests: Mapped[list["RepairRequests"]] = relationship("RepairRequests", back_populates="requester") # noqa: F821
