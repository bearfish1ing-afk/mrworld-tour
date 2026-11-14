import React, { useEffect, useState } from "react";
import type { AdminSection } from "./types/admin";
import { AdminLogin, AdminSignup } from "./components/AdminAuth";
import { AdminProductManagement } from "./components/AdminProductManagement";
import { AdminReservationManagement } from "./components/AdminReservationManagement";
import { AdminInventoryManagement } from "./components/AdminInventoryManagement";
import { clearSession, getSessionName, getToken, onUnauthorized } from "./api/client";

export default function App() {
  // 저장된 토큰이 있으면 로그인 상태로 시작 (새로고침해도 유지, 탭을 닫으면 로그아웃)
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getToken()));
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [adminName, setAdminName] = useState(() => getSessionName() ?? "관리자");
  const [section, setSection] = useState<AdminSection>("products");
  const [notice, setNotice] = useState("");

  // API가 401(토큰 만료)을 돌려주면 로그인 화면으로
  useEffect(() => {
    onUnauthorized(() => {
      setIsLoggedIn(false);
      setAuthView("login");
      setNotice("로그인이 만료되었습니다. 다시 로그인해 주세요.");
    });
    return () => onUnauthorized(null);
  }, []);

  const logout = () => {
    clearSession();
    setIsLoggedIn(false);
    setAuthView("login");
    setNotice("");
  };

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
        notice={notice}
        onLoginSuccess={(name) => {
          setAdminName(name);
          setNotice("");
          setIsLoggedIn(true);
        }}
        onGoSignup={() => setAuthView("signup")}
      />
    );
  }

  switch (section) {
    case "reservations":
      return (
        <AdminReservationManagement adminName={adminName} onNavigate={setSection} onLogout={logout} />
      );
    case "inventory":
      return (
        <AdminInventoryManagement adminName={adminName} onNavigate={setSection} onLogout={logout} />
      );
    case "products":
    default:
      return (
        <AdminProductManagement adminName={adminName} onNavigate={setSection} onLogout={logout} />
      );
  }
}
