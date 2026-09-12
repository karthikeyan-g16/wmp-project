from fastapi import APIRouter

from app.api.v1 import analytics, health, market_data, valuations

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(market_data.router)
api_router.include_router(valuations.router)
api_router.include_router(analytics.router)
