from pydantic import BaseModel


class HoldingAddedEvent(BaseModel):
    holdingId: str
    portfolioId: str
    tickerSymbol: str
    assetType: str
    quantity: float
    averageCost: float


class HoldingUpdatedEvent(BaseModel):
    holdingId: str
    portfolioId: str
    tickerSymbol: str
    previousQuantity: float
    newQuantity: float
    previousAverageCost: float
    newAverageCost: float


class HoldingRemovedEvent(BaseModel):
    holdingId: str
    portfolioId: str
    tickerSymbol: str


class PortfolioCreatedEvent(BaseModel):
    portfolioId: str
    userId: str
    name: str
    currency: str
