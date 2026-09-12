from datetime import date

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_market_data(client: AsyncClient):
    payload = {
        "ticker_symbol": "AAPL",
        "price": 195.50,
        "open_price": 194.00,
        "high_price": 196.00,
        "low_price": 193.50,
        "volume": 50000000,
        "price_date": str(date.today()),
    }
    response = await client.post("/api/v1/market-data", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["ticker_symbol"] == "AAPL"
    assert data["price"] == 195.50


@pytest.mark.asyncio
async def test_get_market_data_generates_simulated(client: AsyncClient):
    response = await client.get("/api/v1/market-data/MSFT")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["ticker_symbol"] == "MSFT"


@pytest.mark.asyncio
async def test_get_latest_price(client: AsyncClient):
    # First create some data
    await client.post("/api/v1/market-data", json={
        "ticker_symbol": "TSLA",
        "price": 245.00,
        "price_date": str(date.today()),
    })
    response = await client.get("/api/v1/market-data/TSLA/latest")
    assert response.status_code == 200
    assert response.json()["ticker_symbol"] == "TSLA"
