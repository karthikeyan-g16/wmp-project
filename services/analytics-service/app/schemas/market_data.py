import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


class MarketDataCreate(BaseModel):
    ticker_symbol: str = Field(..., max_length=20)
    price: float = Field(..., gt=0)
    open_price: float | None = None
    high_price: float | None = None
    low_price: float | None = None
    volume: int | None = None
    price_date: date


class MarketDataResponse(BaseModel):
    id: uuid.UUID
    ticker_symbol: str
    price: float
    open_price: float | None
    high_price: float | None
    low_price: float | None
    volume: int | None
    price_date: date
    source: str
    created_at: datetime

    model_config = {"from_attributes": True}
