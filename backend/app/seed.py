from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.model.users import User, UserRole

def seed_users(db: Session) -> None:
    existing_user = db.query(User).filter(User.emp_id == "EMP001").first()

    if existing_user:
        print("Mock users already exist")
        return

    users = [
        User(
            line_user_id="mock-line-user-1",
            name="demo_user",
            emp_id="EMP001",
            role=UserRole.USER,
            phone="0800000000",
            profile_image_url=None,
        ),
        User(
            line_user_id="mock-line-admin-1",
            name="demo_admin",
            emp_id="EMP002",
            role=UserRole.ADMIN,
            phone="0800000001",
            profile_image_url=None,
        ),
        User(
            line_user_id="mock-line-tech-1",
            name="demo_tech",
            emp_id="EMP003",
            role=UserRole.TECH,
            phone="0800000002",
            profile_image_url=None,
        ),
    ]

    db.add_all(users)
    db.commit()

    print("Mock users created")

def main() -> None:
    db = SessionLocal()
    try:
        seed_users(db)
    finally:
        db.close()

if __name__ == "__main__":
    main()