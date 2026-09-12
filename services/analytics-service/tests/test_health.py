import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_liveness(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert data["service"] == "analytics-service"


@pytest.mark.asyncio
async def test_readiness(client: AsyncClient):
    response = await client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
