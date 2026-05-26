from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.requests import router as repair_requests_router
from app.api.assignments import router as assignments_router
from app.api.logs import router as logs_router

app = FastAPI()

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allows the React frontend to communicate with this backend
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PATCH, etc.)
    allow_headers=["*"],  # Allows all headers
)

app.include_router(repair_requests_router)
app.include_router(assignments_router)
app.include_router(logs_router)

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