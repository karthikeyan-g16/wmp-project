import uuid
from datetime import date, datetime

from pydantic import BaseModel


class AnalyticsSnapshotResponse(BaseModel):
    id: uuid.UUID
    portfolio_id: uuid.UUID
    snapshot_date: date
    total_value: float
    daily_return_pct: float | None
    cumulative_return: float | None
    sharpe_ratio: float | None
    volatility: float | None
    max_drawdown: float | None
    allocation_json: dict
    top_performers: list
    bottom_performers: list
    created_at: datetime

    model_config = {"from_attributes": True}


class AllocationResponse(BaseModel):
    portfolio_id: uuid.UUID
    allocations: dict[str, float]
    total_value: float
