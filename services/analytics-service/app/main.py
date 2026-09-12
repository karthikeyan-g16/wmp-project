from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.api.router import api_router
from app.config import settings
from app.db.base import Base
from app.db.session import engine
from app.middleware.logging import setup_logging
from app.models import *  # noqa: F401,F403
from app.observability.tracing import setup_tracing

setup_logging(settings.LOG_LEVEL, settings.ENVIRONMENT)
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting analytics-service", environment=settings.ENVIRONMENT)

    # Auto-create tables if they don't exist
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables ensured")
    except Exception as e:
        # Multiple workers may race; if tables already exist that's fine
        logger.warning("Table creation skipped (likely already created by another worker)", error=str(e))

    setup_tracing(settings.OTEL_SERVICE_NAME, settings.OTEL_EXPORTER_OTLP_ENDPOINT)

    yield

    # Shutdown
    logger.info("Analytics service stopped")


app = FastAPI(
    title="WMP Analytics Service",
    version="1.0.0",
    description="Wealth Management Platform - Analytics & Market Data Service",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# Routes
app.include_router(api_router)
