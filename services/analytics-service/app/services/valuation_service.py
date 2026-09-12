import uuid
from datetime import date

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.valuation import Valuation
from app.schemas.valuation import PerformanceResponse, ValuationResponse

logger = structlog.get_logger()


async def get_valuations(
    db: AsyncSession, portfolio_id: uuid.UUID, start_date: date | None = None, end_date: date | None = None
) -> list[ValuationResponse]:
    query = select(Valuation).where(Valuation.portfolio_id == portfolio_id)
    if start_date:
        query = query.where(Valuation.valuation_date >= start_date)
    if end_date:
        query = query.where(Valuation.valuation_date <= end_date)
    query = query.order_by(Valuation.valuation_date.desc())

    result = await db.execute(query)
    return [ValuationResponse.model_validate(r) for r in result.scalars().all()]


async def get_latest_valuation(db: AsyncSession, portfolio_id: uuid.UUID) -> ValuationResponse | None:
    query = (
        select(Valuation)
        .where(Valuation.portfolio_id == portfolio_id)
        .order_by(Valuation.valuation_date.desc())
        .limit(1)
    )
    result = await db.execute(query)
    row = result.scalar_one_or_none()
    return ValuationResponse.model_validate(row) if row else None


async def calculate_valuation(
    db: AsyncSession, portfolio_id: uuid.UUID, holdings: list[dict], prices: dict[str, float]
) -> ValuationResponse:
    total_value = 0.0
    total_cost = 0.0

    for holding in holdings:
        ticker = holding["tickerSymbol"]
        qty = holding["quantity"]
        avg_cost = holding["averageCost"]
        current_price = prices.get(ticker, avg_cost)
        total_value += qty * current_price
        total_cost += qty * avg_cost

    gain_loss = total_value - total_cost
    gain_loss_pct = (gain_loss / total_cost * 100) if total_cost > 0 else 0.0

    valuation = Valuation(
        id=uuid.uuid4(),
        portfolio_id=portfolio_id,
        valuation_date=date.today(),
        total_value=round(total_value, 4),
        total_cost=round(total_cost, 4),
        gain_loss=round(gain_loss, 4),
        gain_loss_pct=round(gain_loss_pct, 4),
    )
    db.add(valuation)
    await db.flush()

    logger.info(
        "Valuation calculated",
        portfolio_id=str(portfolio_id),
        total_value=total_value,
        gain_loss_pct=gain_loss_pct,
    )
    return ValuationResponse.model_validate(valuation)


async def get_performance(
    db: AsyncSession, portfolio_id: uuid.UUID, period: str
) -> PerformanceResponse:
    from datetime import timedelta

    period_days = {"1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365, "YTD": (date.today() - date(date.today().year, 1, 1)).days}
    days = period_days.get(period, 30)
    start = date.today() - timedelta(days=days)

    valuations = await get_valuations(db, portfolio_id, start_date=start)

    if len(valuations) < 2:
        return PerformanceResponse(
            portfolio_id=portfolio_id, period=period,
            start_value=0, end_value=0, absolute_return=0, percentage_return=0,
            valuations=valuations,
        )

    start_val = valuations[-1].total_value
    end_val = valuations[0].total_value
    abs_return = end_val - start_val
    pct_return = (abs_return / start_val * 100) if start_val > 0 else 0

    return PerformanceResponse(
        portfolio_id=portfolio_id, period=period,
        start_value=start_val, end_value=end_val,
        absolute_return=round(abs_return, 4), percentage_return=round(pct_return, 4),
        valuations=valuations,
    )
