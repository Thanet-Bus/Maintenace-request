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
  
User creates repair request
Admin sees request
Admin assigns technician
Technician updates status
User sees result

4. list/detail request API
5. update request status API
6. frontend request form + request list
7. then LINE Login
8. then roles/permissions properly

repair_logs
- id PK
- repair_request_id FK -> repair_requests.id
- changed_by FK -> users.id
- status_from
- status_to
- note
- created_at

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