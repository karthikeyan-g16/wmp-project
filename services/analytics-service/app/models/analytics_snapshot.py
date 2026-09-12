import uuid
from datetime import date, datetime

from sqlalchemy import Date, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"
    __table_args__ = (
        UniqueConstraint("portfolio_id", "snapshot_date"),
        {"schema": "analytics_schema"},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    portfolio_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    total_value: Mapped[float] = mapped_column(Numeric(18, 4), nullable=False)
    daily_return_pct: Mapped[float | None] = mapped_column(Numeric(10, 6))
    cumulative_return: Mapped[float | None] = mapped_column(Numeric(10, 6))
    sharpe_ratio: Mapped[float | None] = mapped_column(Numeric(10, 6))
    volatility: Mapped[float | None] = mapped_column(Numeric(10, 6))
    max_drawdown: Mapped[float | None] = mapped_column(Numeric(10, 6))
    allocation_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    top_performers: Mapped[list] = mapped_column(JSONB, default=list)
    bottom_performers: Mapped[list] = mapped_column(JSONB, default=list)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
