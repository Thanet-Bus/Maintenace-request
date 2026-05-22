from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.database import get_db
from app.api.router import router as repair_requests_router

app = FastAPI()

app.include_router(repair_requests_router)

@app.get("/")
async def root():
    return {"message": "server is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/health/db")
def database_health_check(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"database": "ok"}