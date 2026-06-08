# Development Setup

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (only if running frontend outside Docker)

## Initial Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd maintenance-request
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your preferred values
```

### 3. Start the database

```bash
docker compose up -d db
```

> **Note:** Start the database first to ensure it's ready before running migrations. Otherwise, the backend may fail to connect during migration.

### 4. Run database migrations

```bash
docker compose exec backend alembic upgrade head
```

### 5. Seed test user data

```bash
docker compose exec backend python -m app.seed
```

### 6. Start all services

```bash
docker compose up -d
```

## Development Commands

### Run without Docker (Backend)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Run without Docker (Frontend)

> (Requires Node.js 18+)

```bash
cd frontend
npm install
npm run dev
```

### Database Commands

```bash
# Connect to database
docker compose exec db psql -U <POSTGRES_USER> -d <POSTGRES_DB>

# Create migration
docker compose exec backend alembic revision --autogenerate -m "description"

# Apply migrations
docker compose exec backend alembic upgrade head

# Rollback last migration
docker compose exec backend alembic downgrade -1
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── api/           # FastAPI routers/endpoints
│   ├── core/          # Database and config
│   ├── crud/          # Database operations
│   ├── model/         # SQLAlchemy models
│   └── schemas/       # Pydantic schemas
frontend/
├── src/
│   ├── pages/         # Page components
│   ├── components/    # Shared components
│   └── types/         # TypeScript types
```

---

# Development Notes

## Commands Reference

```bash
# Init test user
docker compose exec backend python -m app.seed

# Alembic
docker compose exec backend alembic init alembic

# Database version control
docker compose exec backend alembic current
docker compose exec backend alembic history
```

## Database Commands

```bash
# Database
docker compose exec db psql -U username -d maintenance_db -c "\dt"
docker compose exec db psql -U username -d maintenance_db -c "SELECT * FROM users;"
# change username that has setted

# Migrate
docker compose exec backend alembic revision --autogenerate -m "name changed database schema"
docker compose exec backend alembic upgrade head

# Downgrade
docker compose exec backend alembic downgrade -1
```

## Architecture Notes

- CRUD/service: catches database/business errors, raises your own app error with message/code
- Router/API: catches your app error, converts it to HTTPException for frontend

## Roadmap

7. Implement LINE Login
8. Implement roles/permissions properly

## Status Transitions

| Actor      | Transition              |
| ---------- | ----------------------- |
| Admin      | PENDING → ASSIGNED      |
| Technician | ASSIGNED → IN_PROGRESS  |
| Technician | IN_PROGRESS → COMPLETED |


## Log Fields

- id = repair_request_id
- changed_by = user
- status_to = str
- note = text (on hold)
- timestamp = time now

## Image type

- REQUEST = image uploaded by user when creating request
- COMPLETE = image after technician completes work
- ON_HOLD = image explaining why work is paused
- SIGNATURE = signature image if needed
- OTHER = fallback

## Table Status Descriptions

- **assigned**: admin dated and tech assigned
- **in progress**: tech acknowledge request
- **on hold**: tech on hold, admin change date
- **cancelled**: admin cancelled
- **complete**: tech submit request / admin can complete too

## Refactor Tasks

- Refactor code like in jobdetail implement


LINE Login
→ get LINE user id/profile
→ find/create users row
→ issue your own app token/JWT
→ frontend uses your token for API

1. Implement LINE Login
2. Add employee number completion page
3. Add admin page to set user role = TECHNICIAN
4. Add image upload using current_user.id as uploaded_by

GET  /api/auth/line/login
POST /api/auth/line/callback
GET  /api/auth/me

Frontend clicks Login with LINE
→ redirect to LINE authorization URL
→ LINE redirects back with code
→ frontend sends code to backend
→ backend exchanges code for token
→ backend verifies ID token
→ backend find/create user by line_user_id
→ backend returns your app JWT
