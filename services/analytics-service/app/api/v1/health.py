from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

router = APIRouter()


@router.get("/health")
async def liveness():
    return {"status": "UP", "service": "analytics-service"}


@router.get("/ready")
async def readiness(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "UP", "database": "connected"}
    except Exception as e:
        return {"status": "DOWN", "database": str(e)}
