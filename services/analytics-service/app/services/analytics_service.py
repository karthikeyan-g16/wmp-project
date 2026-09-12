import uuid
from datetime import date

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analytics_snapshot import AnalyticsSnapshot
from app.schemas.analytics_snapshot import AllocationResponse, AnalyticsSnapshotResponse

logger = structlog.get_logger()


async def get_snapshot(
    db: AsyncSession, portfolio_id: uuid.UUID, snapshot_date: date | None = None
) -> AnalyticsSnapshotResponse | None:
    query = select(AnalyticsSnapshot).where(AnalyticsSnapshot.portfolio_id == portfolio_id)
    if snapshot_date:
        query = query.where(AnalyticsSnapshot.snapshot_date == snapshot_date)
    else:
        query = query.order_by(AnalyticsSnapshot.snapshot_date.desc()).limit(1)

    result = await db.execute(query)
    row = result.scalar_one_or_none()
    return AnalyticsSnapshotResponse.model_validate(row) if row else None


async def generate_snapshot(
    db: AsyncSession, portfolio_id: uuid.UUID, holdings: list[dict], prices: dict[str, float]
) -> AnalyticsSnapshotResponse:
    total_value = 0.0
    allocation: dict[str, float] = {}
    performers: list[dict] = []

    for holding in holdings:
        ticker = holding["tickerSymbol"]
        qty = holding["quantity"]
        avg_cost = holding["averageCost"]
        current_price = prices.get(ticker, avg_cost)
        holding_value = qty * current_price
        total_value += holding_value
        asset_type = holding.get("assetType", "STOCK")
        allocation[asset_type] = allocation.get(asset_type, 0) + holding_value

        pnl_pct = ((current_price - avg_cost) / avg_cost * 100) if avg_cost > 0 else 0
        performers.append({"ticker": ticker, "pnl_pct": round(pnl_pct, 2), "value": round(holding_value, 2)})

    # Normalize allocation to percentages
    if total_value > 0:
        allocation = {k: round(v / total_value * 100, 2) for k, v in allocation.items()}

    performers.sort(key=lambda x: x["pnl_pct"], reverse=True)
    top = performers[:3]
    bottom = performers[-3:] if len(performers) >= 3 else performers

    snapshot = AnalyticsSnapshot(
        id=uuid.uuid4(),
        portfolio_id=portfolio_id,
        snapshot_date=date.today(),
        total_value=round(total_value, 4),
        allocation_json=allocation,
        top_performers=top,
        bottom_performers=bottom,
    )
    db.add(snapshot)
    await db.flush()

    logger.info("Analytics snapshot generated", portfolio_id=str(portfolio_id), total_value=total_value)
    return AnalyticsSnapshotResponse.model_validate(snapshot)


async def get_allocation(
    db: AsyncSession, portfolio_id: uuid.UUID
) -> AllocationResponse | None:
    snapshot = await get_snapshot(db, portfolio_id)
    if not snapshot:
        return None
    return AllocationResponse(
        portfolio_id=portfolio_id,
        allocations=snapshot.allocation_json,
        total_value=snapshot.total_value,
    )
