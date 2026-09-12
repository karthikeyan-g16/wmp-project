FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /src

COPY gradlew ./
COPY gradle ./gradle

RUN chmod +x gradlew

COPY build.gradle* settings.gradle* ./

RUN ./gradlew dependencies --no-daemon || true

COPY . .

RUN ./gradlew clean bootJar --no-daemon -x test


FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S appgroup \
    && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /src/build/libs/*.jar /app/portfolio-service.jar

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s \
  --start-period=60s --retries=5 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/portfolio-service.jar"]
