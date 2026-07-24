# Build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/lumen-backend.jar app.jar
EXPOSE 3001

# Ajustes para una instancia pequeña (Render free son 512 MB y poca CPU):
# - MaxRAMPercentage: por defecto la JVM reserva un cuarto de la RAM del contenedor y se
#   queda corta; con 75% el heap se ajusta solo al tamaño real de la instancia.
# - SerialGC: con un core y un heap pequeño rinde mejor que G1 y arranca antes.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+UseSerialGC", "-jar", "app.jar"]
