FROM golang:1.24-alpine AS builder

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux \
    go build -trimpath -ldflags="-s -w" \
    -o /out/auth-service ./cmd/server


FROM alpine:3.21

RUN apk add --no-cache ca-certificates wget \
    && addgroup -S appgroup \
    && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /out/auth-service /app/auth-service

USER appuser

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=5s --retries=5 \
  CMD wget -qO- http://localhost:8081/health || exit 1

ENTRYPOINT ["/app/auth-service"]
