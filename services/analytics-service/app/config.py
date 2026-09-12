from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://analytics_svc_user:localdev123@localhost:5432/wmp"
    DB_SCHEMA: str = "analytics_schema"
    DB_POOL_SIZE: int = 10

    # OpenTelemetry
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://localhost:4317"
    OTEL_SERVICE_NAME: str = "analytics-service"

    # App
    LOG_LEVEL: str = "INFO"
    ENVIRONMENT: str = "local"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
