import uuid
from datetime import date, datetime

from sqlalchemy import Date, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Valuation(Base):
    __tablename__ = "valuations"
    __table_args__ = (
        UniqueConstraint("portfolio_id", "valuation_date"),
        {"schema": "analytics_schema"},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    portfolio_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    valuation_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    total_value: Mapped[float] = mapped_column(Numeric(18, 4), nullable=False)
    total_cost: Mapped[float] = mapped_column(Numeric(18, 4), nullable=False)
    gain_loss: Mapped[float] = mapped_column(Numeric(18, 4), nullable=False)
    gain_loss_pct: Mapped[float | None] = mapped_column(Numeric(10, 4))
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
