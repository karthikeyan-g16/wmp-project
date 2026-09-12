import uuid
from datetime import date, datetime

from sqlalchemy import BigInteger, Date, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MarketData(Base):
    __tablename__ = "market_data"
    __table_args__ = (
        UniqueConstraint("ticker_symbol", "price_date"),
        {"schema": "analytics_schema"},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    ticker_symbol: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    price: Mapped[float] = mapped_column(Numeric(18, 4), nullable=False)
    open_price: Mapped[float | None] = mapped_column(Numeric(18, 4))
    high_price: Mapped[float | None] = mapped_column(Numeric(18, 4))
    low_price: Mapped[float | None] = mapped_column(Numeric(18, 4))
    volume: Mapped[int | None] = mapped_column(BigInteger)
    price_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(50), default="INTERNAL")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
