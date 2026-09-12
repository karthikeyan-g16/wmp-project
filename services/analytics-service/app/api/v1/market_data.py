from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.market_data import MarketDataCreate, MarketDataResponse
from app.services import market_data_service

router = APIRouter(prefix="/api/v1/market-data", tags=["market-data"])


@router.get("/{ticker}", response_model=list[MarketDataResponse])
async def get_market_data(
    ticker: str,
    start_date: date | None = None,
    end_date: date | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await market_data_service.get_market_data(db, ticker, start_date, end_date)


@router.get("/{ticker}/latest", response_model=MarketDataResponse)
async def get_latest_price(ticker: str, db: AsyncSession = Depends(get_db)):
    result = await market_data_service.get_latest_price(db, ticker)
    if not result:
        raise HTTPException(status_code=404, detail=f"No market data found for {ticker}")
    return result


@router.post("", response_model=MarketDataResponse, status_code=201)
async def create_market_data(data: MarketDataCreate, db: AsyncSession = Depends(get_db)):
    return await market_data_service.create_market_data(db, data)
