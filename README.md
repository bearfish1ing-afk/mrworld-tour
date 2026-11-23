# 미스터월드 테마투어 (Mr. World Theme Tour)

허니문, 효도, 골프, 트레킹 테마의 여행 상품을 찾아보고 원하는 옵션으로 예약할 수 있는 웹 서비스입니다.
서울시립대학교 소프트웨어공학 과목 팀 프로젝트로 만들었습니다. (개미팀)

- 고객 화면: https://testmaptest.cloud
- 직원 화면: https://testmaptest.cloud/admin/
- API 문서(Swagger): https://testmaptest.cloud/swagger-ui/index.html

## 주요 기능

### 고객
- 테마, 여행 지역, 출발일, 가격, 키워드로 상품 검색
- 음성 검색 (브라우저 음성인식으로 받은 문장에서 OpenAI가 검색 조건을 뽑아냄)
- 클래식, 그랜드, 프리미엄 등급 선택과 호텔, 식사, 차량, 음료 옵션 변경
- 옵션에 따라 금액이 바로 계산되고, 예약 후 내역 조회와 취소 가능
- 결제는 결제 수단 선택까지만 구현 (실제 결제 연동은 없음)
- 휴대폰 SMS 인증으로 회원가입
- 최근 1년 이용 금액에 따라 브론즈, 실버, 골드 등급 할인

### 직원
- 상품 등록, 판매 상태 변경, 여행 지역 변경
- 예약 조회 및 변경, 상태 변경, 메모 작성
- 기념품 등록과 입고, 입출고 이력 확인

### 자동으로 처리되는 것
- 최소 인원이 모이면 출발 확정 후 예약자에게 문자 발송
- 모집 마감일이 지나도 인원이 부족하면 출발 취소 (10분마다 확인)
- 예약하면 기념품 재고가 차감되고 취소하면 다시 채워짐

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| Backend | Java 17, Spring Boot 4.0.7, Spring Security(JWT), Spring Data JPA |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| DB | MySQL 8.4 |
| 외부 API | OpenAI API, SOLAPI(문자) |
| 배포 | AWS EC2, Docker Compose, Nginx, GitHub Actions, GHCR |

## 폴더 구조

```
├── src/                    # 백엔드 (Spring Boot)
├── customer-frontend/      # 고객 화면
├── frontend/               # 직원 화면
├── scripts/seed-demo.mjs   # 데모 데이터 넣는 스크립트
├── test-users.sql          # 테스트 계정
├── Dockerfile              # 백엔드 이미지
├── Dockerfile.web          # 프론트(고객+직원) nginx 이미지
├── docker-compose.yml      # 로컬용
├── docker-compose.prod.yml # 서버용
└── nginx.conf, nginx.prod.conf
```

## 로컬에서 실행하기

### 1. .env 만들기
프로젝트 루트에 `.env` 파일을 만들고 아래 값을 채워주세요. 키 값이 들어가니 깃에는 올리지 않습니다.

```
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=mrworld
MYSQL_USER=
MYSQL_PASSWORD=

DB_URL=jdbc:mysql://localhost:3307/mrworld?serverTimezone=Asia/Seoul
DB_USERNAME=
DB_PASSWORD=

JWT_SECRET_BASE64=
SMS_HMAC_SECRET_BASE64=
SOLAPI_API_KEY=
SOLAPI_API_SECRET=
SOLAPI_SENDER=
OPENAI_API_KEY=
OPENAI_MODEL=
```

`JWT_SECRET_BASE64`, `SMS_HMAC_SECRET_BASE64`는 `openssl rand -base64 32`로 만들면 됩니다.

### 2. DB 띄우기
```bash
docker compose up -d mysql
```
localhost:3307로 열립니다.

### 3. 백엔드 실행
```bash
./gradlew bootRun
```
localhost:8080에서 실행됩니다.

### 4. 프론트 실행
터미널을 두 개 열어서 각각 실행합니다.
```bash
cd customer-frontend
npm install
npm run dev
```
```bash
cd frontend
npm install
npm run dev
```
고객 화면은 localhost:5173, 직원 화면은 나중에 켠 쪽이 5174 같은 다음 포트로 뜹니다. (직원 화면은 주소 뒤에 /admin/)
두 화면 다 `/api` 요청은 localhost:8080으로 넘어갑니다.

## 테스트 계정, 데모 데이터

`test-users.sql`을 DB에 먼저 넣어주세요.

| 구분 | 아이디 | 비밀번호 |
| --- | --- | --- |
| 직원 | admin@test.com | Test1234! |
| 고객 | user1@test.com ~ user3@test.com | Test1234! |

백엔드를 켜둔 상태에서 아래를 실행하면 데모용 상품과 예약이 들어갑니다.
```bash
cd scripts
node seed-demo.mjs
```

## 배포

main 브랜치에 머지되면 GitHub Actions가 알아서 배포합니다.

1. 백엔드 이미지(`mrworld-tour`)와 프론트 이미지(`mrworld-tour-web`)를 빌드해서 GHCR에 올림
2. AWS SSM으로 EC2에 접속해 `docker-compose.prod.yml` 기준으로 새 이미지를 받아 다시 띄움

## 팀원

| 이름 | 담당 |
| --- | --- |
| 배은주 | 팀장, 백엔드, 음성인식, 배포 |
| 정민재 | DB 설계, 백엔드, 음성인식 |
| 김지연 | 프론트엔드, UI/UX |