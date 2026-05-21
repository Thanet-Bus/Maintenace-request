Alembic for migration
docker compose exec backend alembic init alembic

database version control:
docker compose exec backend alembic current
docker compose exec backend alembic history

- migrate
    docker compose exec backend alembic revision --autogenerate -m "name changed database schema"
    docker compose exec backend alembic upgrade head

- downgrade
    docker compose exec backend alembic downgrade -1
  