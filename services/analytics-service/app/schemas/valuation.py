import uuid
from datetime import date, datetime

from pydantic import BaseModel


class ValuationResponse(BaseModel):
    id: uuid.UUID
    portfolio_id: uuid.UUID
    valuation_date: date
    total_value: float
    total_cost: float
    gain_loss: float
    gain_loss_pct: float | None
    currency: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PerformanceResponse(BaseModel):
    portfolio_id: uuid.UUID
    period: str
    start_value: float
    end_value: float
    absolute_return: float
    percentage_return: float
    valuations: list[ValuationResponse]
