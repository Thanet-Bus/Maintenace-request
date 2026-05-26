add init test user
docker compose exec backend python -m app.seed

# Alembic
docker compose exec backend alembic init alembic

database version control:
docker compose exec backend alembic current
docker compose exec backend alembic history

# database
docker compose exec db psql -U username -d maintenance_db -c "\dt"
docker compose exec db psql -U username -d maintenance_db -c "SELECT * FROM users;"
*change username that has setted

- migrate
    docker compose exec backend alembic revision --autogenerate -m "name changed database schema"
    docker compose exec backend alembic upgrade head

- downgrade
    docker compose exec backend alembic downgrade -1
  
CRUD/service:
  catches database/business errors
  raises your own app error with message/code

Router/API:
  catches your app error
  converts it to HTTPException for frontend

6. frontend request form + request list
7. then LINE Login
8. then roles/permissions properly

Admin changed:
PENDING → ASSIGNED

Technician changed:
ASSIGNED → IN_PROGRESS

Technician changed:
IN_PROGRESS → COMPLETED


repair_images
- id PK
- repair_request_id FK -> repair_requests.id
- uploaded_by FK -> users.id
- image_url
- image_type
- created_at

repair_reviews
- id PK
- repair_request_id FK -> repair_requests.id
- reviewer_id FK -> users.id
- technician_id FK -> users.id
- rating
- comment
- created_at

assigned -> admin dated and tech assigned
in progress -> tech acknowledge request
on hold -> change date, tech on hold
cancelled -> admin cancelled
complete -> tech submit request/ admin can complete too

id =  repair_request_id
changed_by = user
status_to = str
note = text (on hold)
timestamp = time now