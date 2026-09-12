FROM python:3.12-slim AS builder

WORKDIR /build

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
COPY app ./app

COPY migrations ./migrations

RUN pip install --no-cache-dir --prefix=/install .


FROM python:3.12-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libpq5 \
       curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system appgroup \
    && useradd --system --gid appgroup appuser

WORKDIR /app

COPY --from=builder /install /usr/local
COPY --from=builder /build/app ./app
COPY --from=builder /build/migrations ./migrations

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=5 \
  CMD curl --fail http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "2"]
