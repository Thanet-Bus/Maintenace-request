from enum import Enum
from sqlalchemy import Enum as SQLEnum

class RepairStatus(str, Enum):
    PENDING = "PENDING"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

repair_status_enum = SQLEnum(
    RepairStatus,
    name="repair_status_enum",
)

class RepairImageType(str, Enum):
    REQUEST = "REQUEST"
    COMPLETE = "COMPLETE"
    ON_HOLD = "ON_HOLD"
    SIGNATURE = "SIGNATURE"
    OTHER = "OTHER"

repair_image_type_enum = SQLEnum(
    RepairImageType,
    name="repair_image_type_enum",
)