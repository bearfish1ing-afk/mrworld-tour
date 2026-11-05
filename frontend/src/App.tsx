import React, { useState } from "react";
import type { Product, AdminSection } from "./types/admin";
import { AdminLogin, AdminSignup } from "./components/AdminAuth";
import { AdminProductManagement } from "./components/AdminProductManagement";
import { AdminReservationManagement } from "./components/AdminReservationManagement";
import { AdminInventoryManagement } from "./components/AdminInventoryManagement";

const initialProducts: Product[] = [
  {
    name: "일본 규슈 온천 효도여행 4일",
    theme: "효도여행",
    country: "일본",
    grades: "클래식 / 프리미엄",
    price: "1,290,000",
    options: "숙소 · 식사 · 음료",
    status: "판매 중",
    date: "2026-10-02",
    duration: "3박 4일",
  },
  {
    name: "몰디브 아일랜드 허니문 6일",
    theme: "허니문",
    country: "몰디브",
    grades: "프리미엄 / 그랜드",
    price: "3,990,000",
    options: "숙소 · 식사 · 음료",
    status: "판매 중",
    date: "2026-10-01",
    duration: "5박 6일",
  },
  {
    name: "스위스 알프스 힐링여행 7일",
    theme: "힐링여행",
    country: "스위스",
    grades: "클래식 / 프리미엄",
    price: "3,490,000",
    options: "숙소 · 식사 · 음료",
    status: "판매 중",
    date: "2026-10-01",
    duration: "6박 7일",
  },
  {
    name: "이탈리아 미식 기행 8일",
    theme: "미식여행",
    country: "이탈리아",
    grades: "그랜드 / 프리미엄",
    price: "4,200,000",
    options: "숙소 · 식사 · 음료",
    status: "판매 중지",
    date: "2026-09-28",
    duration: "7박 8일",
  },
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 편의상 초기 진입 허용 (로그아웃 시 로그인 화면으로 이동)
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [adminName, setAdminName] = useState("최고관리자");
  const [section, setSection] = useState<AdminSection>("products");

  // 미인증 상태 시 피그마 로그인 / 회원가입 뷰 전환
  if (!isLoggedIn) {
    if (authView === "signup") {
      return (
        <AdminSignup
          onGoLogin={() => setAuthView("login")}
          onComplete={() => setAuthView("login")}
        />
      );
    }
    return (
      <AdminLogin
        onLoginSuccess={(name) => {
          setAdminName(name);
          setIsLoggedIn(true);
        }}
        onGoSignup={() => setAuthView("signup")}
      />
    );
  }

  // 관리자 대시보드 탭 분기 (컴포넌트 import 방식)
  switch (section) {
    case "reservations":
      return (
        <AdminReservationManagement
          adminName={adminName}
          onNavigate={setSection}
          onLogout={() => setIsLoggedIn(false)}
        />
      );
    case "inventory":
      return (
        <AdminInventoryManagement
          adminName={adminName}
          onNavigate={setSection}
          onLogout={() => setIsLoggedIn(false)}
        />
      );
    case "products":
    default:
      return (
        <AdminProductManagement
          productItems={initialProducts}
          adminName={adminName}
          onNavigate={setSection}
          onLogout={() => setIsLoggedIn(false)}
        />
      );
  }
}