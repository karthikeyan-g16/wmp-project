import random
import uuid
from datetime import date, timedelta

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.market_data import MarketData
from app.schemas.market_data import MarketDataCreate, MarketDataResponse

logger = structlog.get_logger()

# Simulated base prices for demo tickers
SIMULATED_PRICES: dict[str, float] = {
    "AAPL": 195.0, "GOOGL": 175.0, "MSFT": 415.0, "AMZN": 185.0,
    "TSLA": 245.0, "NVDA": 880.0, "META": 500.0, "VOO": 480.0,
    "BND": 73.0, "QQQ": 430.0,
}


async def get_market_data(
    db: AsyncSession, ticker: str, start_date: date | None = None, end_date: date | None = None
) -> list[MarketDataResponse]:
    query = select(MarketData).where(MarketData.ticker_symbol == ticker.upper())
    if start_date:
        query = query.where(MarketData.price_date >= start_date)
    if end_date:
        query = query.where(MarketData.price_date <= end_date)
    query = query.order_by(MarketData.price_date.desc())

    result = await db.execute(query)
    rows = result.scalars().all()

    if not rows:
        logger.info("No market data found, generating simulated data", ticker=ticker)
        rows = await _generate_simulated_data(db, ticker.upper())

    return [MarketDataResponse.model_validate(r) for r in rows]


async def get_latest_price(db: AsyncSession, ticker: str) -> MarketDataResponse | None:
    query = (
        select(MarketData)
        .where(MarketData.ticker_symbol == ticker.upper())
        .order_by(MarketData.price_date.desc())
        .limit(1)
    )
    result = await db.execute(query)
    row = result.scalar_one_or_none()

    if not row:
        rows = await _generate_simulated_data(db, ticker.upper())
        row = rows[0] if rows else None

    return MarketDataResponse.model_validate(row) if row else None


async def create_market_data(db: AsyncSession, data: MarketDataCreate) -> MarketDataResponse:
    record = MarketData(
        id=uuid.uuid4(),
        ticker_symbol=data.ticker_symbol.upper(),
        price=data.price,
        open_price=data.open_price,
        high_price=data.high_price,
        low_price=data.low_price,
        volume=data.volume,
        price_date=data.price_date,
    )
    db.add(record)
    await db.flush()
    logger.info("Market data created", ticker=data.ticker_symbol, price=data.price)
    return MarketDataResponse.model_validate(record)


async def _generate_simulated_data(db: AsyncSession, ticker: str) -> list[MarketData]:
    base_price = SIMULATED_PRICES.get(ticker, 100.0)
    today = date.today()
    records = []

    for i in range(30):
        d = today - timedelta(days=29 - i)
        daily_change = random.uniform(-0.03, 0.03)
        price = round(base_price * (1 + daily_change * (i / 30)), 4)
        record = MarketData(
            id=uuid.uuid4(),
            ticker_symbol=ticker,
            price=price,
            open_price=round(price * random.uniform(0.98, 1.0), 4),
            high_price=round(price * random.uniform(1.0, 1.02), 4),
            low_price=round(price * random.uniform(0.97, 1.0), 4),
            volume=random.randint(1_000_000, 50_000_000),
            price_date=d,
            source="SIMULATED",
        )
        records.append(record)
        db.add(record)

    await db.flush()
    logger.info("Generated simulated market data", ticker=ticker, days=30)
    return records
