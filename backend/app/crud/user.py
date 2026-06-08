from sqlalchemy.orm import Session
from app.model.users import User, UserRole
from app.schemas.user import UserCreate, UserUpdate

def create_user(db: Session, data: UserCreate) -> User:
    user = User(
        line_user_id=data.line_user_id,
        name=data.name,
        emp_id=data.emp_id,
        phone=data.phone,
        profile_image_url=data.profile_image_url,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_line_id(db: Session, line_user_id: str) -> User | None:
    return db.query(User).filter(User.line_user_id == line_user_id).first()

def get_or_create_line_user(
    db: Session,
    line_user_id: str,
    display_name: str | None,
    profile_image_url: str | None,
) -> User:
    user = get_user_by_line_id(db, line_user_id)

    if user:
        user.name = display_name
        user.profile_image_url = profile_image_url
        db.commit()
        db.refresh(user)
        return user

    user = User(
        line_user_id=line_user_id,
        name=display_name,
        profile_image_url=profile_image_url,
        role=UserRole.USER,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def get_user_by_id(db: Session, id: int) -> User | None:
    return db.query(User).filter(User.id == id).first()

def get_user_by_emp_id(db: Session, emp_id: str) -> User | None:
    return db.query(User).filter(User.emp_id == emp_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    return db.query(User).offset(skip).limit(limit).all()

def get_technicians(db: Session) -> list[User]:
    return db.query(User).filter(User.role == UserRole.TECH).all()

def update_user(db: Session, user: User, data: UserUpdate) -> User:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(user, field):
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()