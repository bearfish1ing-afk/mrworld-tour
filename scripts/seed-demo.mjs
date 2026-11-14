// 관리자 화면 시험용 데모 데이터 넣기
// 실행: 백엔드(localhost:8080)를 켠 상태에서  node seed-demo.mjs
// - 테스트 계정(test-users.sql)이 DB에 있어야 해요: admin@test.com, user1~3@test.com / Test1234!
// - 모든 데이터는 실제 API로 넣어서 금액·기본 옵션·기념품 재고가 서비스 규칙대로 맞춰져요
// - 상품이 이미 있으면 중복을 막으려고 멈춰요. 그래도 넣으려면: node seed-demo.mjs --force

const BASE = process.env.API_BASE ?? "http://localhost:8080";
const PASSWORD = "Test1234!";
const force = process.argv.includes("--force");

async function call(path, { method = "GET", body, token } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = data?.errors?.map((e) => `${e.field}: ${e.message}`).join(", ") || data?.detail || text;
    throw new Error(`${method} ${path} → ${res.status} ${detail}`);
  }
  return data;
}

const login = async (email, admin = false) =>
  (await call(admin ? "/api/admin/auth/login" : "/api/auth/login", {
    method: "POST",
    body: { email, password: PASSWORD },
  })).accessToken;

// 오늘 기준 날짜 (항상 미래 상품이 되도록)
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

// 공통 옵션: 호텔·식사는 종류 고정 + 가격, 음료는 자유
const commonOptions = ({ hotel4 = 150000, hotel5 = 320000, local = 40000, fine = 90000, limo = null } = {}) => [
  { optionType: "HOTEL", hotelLevel: "STAR_3", extraPrice: 0 },
  { optionType: "HOTEL", hotelLevel: "STAR_4", extraPrice: hotel4 },
  { optionType: "HOTEL", hotelLevel: "STAR_5", extraPrice: hotel5 },
  { optionType: "MEAL", mealType: "LUNCHBOX", extraPrice: 0 },
  { optionType: "MEAL", mealType: "LOCAL_RESTAURANT", extraPrice: local },
  { optionType: "MEAL", mealType: "FINE_DINING", extraPrice: fine },
  { optionType: "DRINK", optionName: "샴페인", extraPrice: 35000, applyRule: "PER_PERSON" },
  { optionType: "DRINK", optionName: "와인", extraPrice: 25000, applyRule: "PER_PERSON" },
  { optionType: "DRINK", optionName: "커피", extraPrice: 6000, applyRule: "PER_PERSON" },
  ...(limo ? [{ optionType: "VEHICLE", vehicleType: "PRIVATE_LIMOUSINE", extraPrice: limo }] : []),
];

const PRODUCTS = [
  {
    key: "honeymoon",
    themeId: 1, productCode: "HONEY-MLD-01", title: "몰디브 오버워터 허니문 5박 7일", country: "몰디브",
    duration: "5박 7일", description: "로맨틱 스페셜 룸 데코레이션과 커플 기념티 제공",
    basePrice: 2890000, depart: 45, nights: 6, maxPeople: 10,
    options: commonOptions({ hotel4: 0, hotel5: 450000, limo: 250000 }),
    grades: [
      { grade: "GRAND", extraPrice: 0, defaultGrade: true },
      { grade: "PREMIUM", extraPrice: 700000, defaultGrade: false },
    ],
  },
  {
    key: "parents",
    themeId: 2, productCode: "PARENT-JP-01", title: "일본 규슈 온천 효도여행 3박 4일", country: "일본",
    duration: "3박 4일", description: "고품격 안마·지압 서비스와 건강 인삼 기념품 제공",
    basePrice: 1290000, depart: 30, nights: 3, maxPeople: 10,
    options: commonOptions({ hotel4: 0, hotel5: 280000 }),
    grades: [
      { grade: "GRAND", extraPrice: 0, defaultGrade: true },
      { grade: "PREMIUM", extraPrice: 450000, defaultGrade: false },
    ],
  },
  {
    key: "golf",
    themeId: 3, productCode: "GOLF-JEJU-01", title: "제주 명문 골프 리조트 2박 3일", country: "한국",
    duration: "2박 3일", description: "유명 골프 리조트 테마 연출, 골프공 제공",
    basePrice: 890000, depart: 20, nights: 2, maxPeople: 10,
    options: commonOptions({ hotel4: 120000, hotel5: 260000, limo: 180000 }),
    grades: [
      { grade: "CLASSIC", extraPrice: 0, defaultGrade: true },
      { grade: "GRAND", extraPrice: 200000, defaultGrade: false },
      { grade: "PREMIUM", extraPrice: 480000, defaultGrade: false },
    ],
  },
  {
    key: "trek",
    themeId: 4, productCode: "TREK-CH-01", title: "스위스 알프스 트레킹 4박 5일", country: "스위스",
    duration: "4박 5일", description: "트레킹·산악 테마 어드벤처, 아웃도어 스카프 제공",
    basePrice: 2190000, depart: 60, nights: 4, maxPeople: 12,
    options: commonOptions({ limo: 300000 }),
    grades: [
      { grade: "CLASSIC", extraPrice: 0, defaultGrade: true },
      { grade: "GRAND", extraPrice: 300000, defaultGrade: false },
      { grade: "PREMIUM", extraPrice: 650000, defaultGrade: false },
    ],
  },
  {
    key: "nepal",
    themeId: 4, productCode: "TREK-NP-01", title: "네팔 안나푸르나 트레킹 6박 8일", country: "네팔",
    duration: "6박 8일", description: "판매 중지 상태 확인용 상품",
    basePrice: 1790000, depart: 75, nights: 7, maxPeople: 8,
    options: commonOptions(),
    grades: [{ grade: "CLASSIC", extraPrice: 0, defaultGrade: true }],
  },
];

async function main() {
  console.log(`API: ${BASE}`);
  const admin = await login("admin@test.com", true);
  const users = {
    user1: await login("user1@test.com"),
    user2: await login("user2@test.com"),
    user3: await login("user3@test.com"),
  };

  const existing = await call("/api/admin/products?page=0&size=1", { token: admin });
  if (existing.totalElements > 0 && !force) {
    console.log(`이미 상품이 ${existing.totalElements}개 있어서 멈췄어요. 그래도 넣으려면: node seed-demo.mjs --force`);
    return;
  }

  // 1) 기념품 입고 (골프공은 일부러 적게 → 재고 부족 표시 확인용)
  const items = (await call("/api/admin/items?page=0&size=100", { token: admin })).content;
  const itemId = (name) => items.find((i) => i.itemName === name)?.id;
  for (const [name, qty] of [["커플 기념티", 20], ["건강 인삼", 15], ["골프공", 3], ["스카프", 30]]) {
    if (!itemId(name)) throw new Error(`기념품 '${name}'이 없어요. 서버를 한 번 켜서 ThemeDataInitializer가 돌았는지 확인해 주세요.`);
    await call(`/api/admin/items/${itemId(name)}/inputs`, { method: "POST", token: admin, body: { quantity: qty, reason: "데모 데이터 입고" } });
    console.log(`입고: ${name} ${qty}개`);
  }

  // 2) 상품 등록
  const ids = {};
  for (const p of PRODUCTS) {
    const departureDate = day(p.depart);
    const res = await call("/api/admin/products", {
      method: "POST",
      token: admin,
      body: {
        themeId: p.themeId, productCode: p.productCode, title: p.title, country: p.country,
        duration: p.duration, description: p.description, basePrice: p.basePrice, status: "RECRUITING",
        departureDate, returnDate: day(p.depart + p.nights), deadline: `${day(p.depart - 10)}T23:59:00`,
        maxPeople: p.maxPeople, minPeople: 3, options: p.options, grades: p.grades,
      },
    });
    ids[p.key] = res.productId;
    console.log(`상품 등록: #${res.productId} ${p.title}`);
  }

  // 상품별 옵션/등급 ID 찾기
  const details = {};
  for (const [key, id] of Object.entries(ids)) details[key] = await call(`/api/admin/products/${id}`, { token: admin });
  const grade = (key, g) => details[key].grades.find((x) => x.grade === g).id;
  const opt = (key, name) => details[key].options.find((o) => o.optionName === name).id;

  const reserve = async (who, key, body, note) => {
    const res = await call("/api/reservations", {
      method: "POST",
      token: users[who],
      body: { productId: ids[key], paymentMethod: "CARD", ...body },
    });
    console.log(`예약: ${who} → ${key} #${res.reservationId} ${res.status} ${res.finalAmount.toLocaleString()}원 ${note ?? ""}`);
    return res.reservationId;
  };

  // 3) 예약
  // 허니문: 2쌍(4명) → 3명 이상이라 출발 확정
  await reserve("user1", "honeymoon", { productGradeId: grade("honeymoon", "PREMIUM"), people: 2 }, "(프리미엄, 샴페인 기본 포함)");
  await reserve("user2", "honeymoon", { productGradeId: grade("honeymoon", "GRAND"), people: 2, vehicleOptionId: opt("honeymoon", "VIP 리무진") }, "(리무진 변경)");

  // 효도: 4명 한 번에 → 바로 출발 확정
  const parentsId = await reserve("user3", "parents", { productGradeId: grade("parents", "GRAND"), people: 4, drinks: [{ optionId: opt("parents", "커피"), quantity: 4 }] }, "(커피 추가)");

  // 골프: 골프공 3개뿐 → 마지막 예약은 기념품 부족
  await reserve("user1", "golf", { productGradeId: grade("golf", "CLASSIC"), people: 1 });
  await reserve("user2", "golf", { productGradeId: grade("golf", "GRAND"), people: 1, hotelOptionId: opt("golf", "5등급 호텔") }, "(호텔 업그레이드)");
  await reserve("user3", "golf", { productGradeId: grade("golf", "CLASSIC"), people: 1 }, "(3명 → 출발 확정)");
  await reserve("user1", "golf", { productGradeId: grade("golf", "PREMIUM"), people: 2 }, "(골프공 부족 → 0개 배정)");

  // 트레킹: 2명 → 아직 확정 대기
  await reserve("user2", "trek", {
    productGradeId: grade("trek", "CLASSIC"), people: 2,
    mealOptionId: opt("trek", "고급 레스토랑 스테이크"), drinks: [{ optionId: opt("trek", "샴페인"), quantity: 2 }],
  }, "(요구사항 예시: 클래식 + 스테이크 + 샴페인)");
  const trekCancel = await reserve("user3", "trek", { productGradeId: grade("trek", "GRAND"), people: 1 });

  // 네팔: 1명 예약 후 판매 중지
  await reserve("user1", "nepal", { productGradeId: grade("nepal", "CLASSIC"), people: 1 });

  // 4) 취소, 메모, 판매 중지
  await call(`/api/reservations/${trekCancel}/cancel`, { method: "PATCH", token: users.user3 });
  console.log(`예약 취소: #${trekCancel} (user3, 트레킹)`);
  await call(`/api/admin/reservations/${parentsId}/memo`, { method: "PATCH", token: admin, body: { memo: "어르신 동반, 1층 객실 요청" } });
  console.log(`관리자 메모: #${parentsId}`);
  await call(`/api/admin/products/${ids.nepal}/status`, { method: "PATCH", token: admin, body: { status: "CLOSED" } });
  console.log(`판매 중지: #${ids.nepal} 네팔 트레킹`);

  // 5) 결과 요약
  const products = (await call("/api/admin/products?page=0&size=100", { token: admin })).content;
  console.log("\n상품 현황");
  for (const p of products) console.log(`  #${p.id} ${p.title} | ${p.status} | ${p.currentPeople}/${p.maxPeople}명`);
  const stock = (await call("/api/admin/items?page=0&size=100", { token: admin })).content;
  console.log("기념품 재고");
  for (const i of stock) console.log(`  ${i.itemName}: ${i.currentAmount}개`);
  console.log("\n완료! 관리자 화면(http://localhost:5173)에서 확인해 보세요.");
}

main().catch((e) => {
  console.error("\n실패:", e.message);
  process.exit(1);
});
