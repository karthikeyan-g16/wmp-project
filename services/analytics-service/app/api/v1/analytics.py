from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.analytics_snapshot import AllocationResponse, AnalyticsSnapshotResponse
from app.schemas.valuation import PerformanceResponse
from app.services import analytics_service, valuation_service

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


@router.get("/{portfolio_id}/snapshot", response_model=AnalyticsSnapshotResponse)
async def get_snapshot(
    portfolio_id: UUID, snapshot_date: date | None = None, db: AsyncSession = Depends(get_db)
):
    result = await analytics_service.get_snapshot(db, portfolio_id, snapshot_date)
    if not result:
        raise HTTPException(status_code=404, detail="No analytics snapshot found")
    return result


@router.get("/{portfolio_id}/performance", response_model=PerformanceResponse)
async def get_performance(
    portfolio_id: UUID, period: str = "1M", db: AsyncSession = Depends(get_db)
):
    return await valuation_service.get_performance(db, portfolio_id, period)


@router.get("/{portfolio_id}/allocation", response_model=AllocationResponse)
async def get_allocation(portfolio_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await analytics_service.get_allocation(db, portfolio_id)
    if not result:
        raise HTTPException(status_code=404, detail="No allocation data found")
    return result


@router.post("/{portfolio_id}/snapshot/generate", response_model=AnalyticsSnapshotResponse, status_code=201)
async def generate_snapshot(portfolio_id: UUID, db: AsyncSession = Depends(get_db)):
    # In production, fetch holdings from Portfolio Service
    result = await analytics_service.generate_snapshot(db, portfolio_id, holdings=[], prices={})
    return result
