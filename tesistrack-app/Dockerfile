# ============================================================
#  Dockerfile del backend (Spring Boot + Maven)
#  Va en la MISMA carpeta que el pom.xml
#  Dos etapas:
#   1. "build": una imagen con Maven y el JDK compila el .jar
#   2. final:   una imagen chica, solo con Java (JRE) y el .jar
# ============================================================

# ---------- Etapa 1: compilar ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Primero solo el pom.xml: si no cambian las dependencias,
# Docker reutiliza esta capa y no las vuelve a descargar.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Después el código fuente
COPY src ./src
RUN mvn -B -q package -DskipTests

# ---------- Etapa 2: ejecutar ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Un usuario sin privilegios de administrador (número 10001)
RUN addgroup -S -g 10001 app && adduser -S -u 10001 -G app app

COPY --from=build /app/target/*.jar app.jar
USER 10001

EXPOSE 8080

# La JVM usa hasta el 75% de la memoria que le dé el contenedor
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]