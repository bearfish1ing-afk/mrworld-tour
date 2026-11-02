FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app

COPY gradlew build.gradle settings.gradle ./
COPY gradle ./gradle
#라이브러리 다운로드 및 gradle백그라운드 프로세스 안 띄움
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

COPY src ./src
#spring boot용 jar생성하기
RUN ./gradlew bootJar -x test --no-daemon

FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
