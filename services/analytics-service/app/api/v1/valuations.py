from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.valuation import PerformanceResponse, ValuationResponse
from app.services import valuation_service

router = APIRouter(prefix="/api/v1/valuations", tags=["valuations"])


@router.get("/{portfolio_id}", response_model=list[ValuationResponse])
async def get_valuations(
    portfolio_id: UUID,
    start_date: date | None = None,
    end_date: date | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await valuation_service.get_valuations(db, portfolio_id, start_date, end_date)


@router.get("/{portfolio_id}/latest", response_model=ValuationResponse)
async def get_latest_valuation(portfolio_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await valuation_service.get_latest_valuation(db, portfolio_id)
    if not result:
        raise HTTPException(status_code=404, detail="No valuation found for this portfolio")
    return result


@router.post("/{portfolio_id}/calculate", response_model=ValuationResponse, status_code=201)
async def calculate_valuation(portfolio_id: UUID, db: AsyncSession = Depends(get_db)):
    # In production, this would fetch holdings from Portfolio Service via REST
    result = await valuation_service.calculate_valuation(db, portfolio_id, holdings=[], prices={})
    return result
