# syntax=docker/dockerfile:1.6

############################
# Build stage (Gradle + JDK 21)
############################
FROM gradle:8.9-jdk21-alpine AS build
WORKDIR /workspace

# (1) Kopiuj wrapper/konfigurację aby keszować zależności
COPY gradle gradle
COPY gradlew .
COPY settings.gradle* build.gradle* gradle.properties* ./
RUN chmod +x gradlew

# Opcjonalne podgrzanie cache (zależności), nie zawodzi buildu w razie braku kodu
RUN ./gradlew --no-daemon build -x test || true

# (2) Kopiuj źródła i buduj fat-jar (bootJar)
COPY . .
ARG SKIP_TESTS=true
RUN if [ "$SKIP_TESTS" = "true" ]; then \
      ./gradlew --no-daemon clean bootJar -x test; \
    else \
      ./gradlew --no-daemon clean bootJar; \
    fi

# (3) Ustal nazwę artefaktu (bez *-plain.jar) i przenieś do stałej ścieżki
RUN JAR_FILE=$(ls build/libs/*.jar | grep -v 'plain' | head -n 1) && \
    cp "$JAR_FILE" /workspace/app.jar

############################
# Runtime stage (JRE 21)
############################
FROM eclipse-temurin:21-jre-alpine

# curl do healthchecka z docker-compose
RUN apk add --no-cache curl

WORKDIR /app

# Uruchamiaj jako non-root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Skopiuj z builda
COPY --from=build /workspace/app.jar ./app.jar

# Ten port możesz nadpisać w compose przez SERVER_PORT
EXPOSE 8080

# Proste limity JVM (możesz podmienić w compose przez JAVA_OPTS)
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"

# Start
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
