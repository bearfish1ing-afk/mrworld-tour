import { useState, useEffect } from "react";
import { CustomerLogin, CustomerSignup } from "./CustomerAuth";
import MyPage from "./MyPage";
import PaymentPage from "./PaymentPage";
import ProductDetailPage, {
  type ReservationSelection,
} from "./ProductDetailPage";
import ReservationHistoryPage, {
  type Reservation,
  initialReservations,
} from "./ReservationHistoryPage";
import SearchResultsPage from "./SearchResultsPage";
import ThemeTravelPage, {
  type SelectedProduct,
  type ThemeId,
} from "./ThemeTravelPage";
import TravelHistoryModal from "./TravelHistoryModal";

const asset = (name: string) => `/assets/${name}`;

const themeMenuItems = [
  { name: "허니문", id: "honeymoon" as const },
  { name: "효도", id: "parents" as const },
  { name: "골프", id: "golf" as const },
  { name: "트레킹", id: "trekking" as const },
];

const guideMenuItems = ["예약 안내", "결제 안내", "취소 / 환불"];

const customerChannels = [
  ["해외여행 문의", "1588-2200", "연중무휴 09:00 ~ 20:00"],
  ["국내여행 문의", "1588-3300", "연중무휴 09:00 ~ 20:00"],
  ["해외항공권 문의", "1588-4400", "평일 09:00 ~ 18:00"],
  ["단체여행 문의", "1588-5500", "평일 09:00 ~ 18:00"],
];

export type GuideType = "reservation" | "payment" | "cancel";

function Logo({ onHome }: { onHome?: () => void }) {
  return (
    <a
      className="flex shrink-0 items-center gap-1.5 cursor-pointer"
      href="#"
      aria-label="미스터 월드 홈"
      onClick={(event) => {
        if (onHome) {
          event.preventDefault();
          onHome();
        }
      }}
    >
      <span className="relative h-14 w-[55px] overflow-hidden">
        <img
          className="absolute left-[-52.17%] top-[-47.89%] h-[198.59%] w-[204.35%] max-w-none pointer-events-none"
          src={asset("5e724.png")}
          alt=""
        />
      </span>
      <span className="font-eb-bold text-[32px] leading-[1.1] tracking-[-0.64px] text-[#1596b4]">
        미스터 월드
      </span>
    </a>
  );
}

function Header({
  onHome,
  onLogin,
  onSignup,
  onMyPage,
  onReservations,
  onSearch,
  onTheme,
  onGuide,
  searchValue,
  currentUser,
  onLogout,
}: {
  onHome?: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
  onMyPage?: () => void;
  onReservations?: () => void;
  onSearch?: (query: string) => void;
  onTheme?: (theme: ThemeId) => void;
  onGuide?: (type: GuideType) => void;
  searchValue?: string;
  currentUser?: string;
  onLogout?: () => void;
}) {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  return (
    <header className="relative z-20 bg-white">
      <div className="border-b border-black">
        <div className="mx-auto flex min-h-[100px] max-w-[1280px] items-center justify-between px-5 py-3.5 md:px-10 lg:px-[100px]">
          <Logo onHome={onHome} />
          <div className="hidden h-[85px] w-36 flex-col items-end justify-between pt-1.5 sm:flex">
            <div className="flex gap-3 font-roboto-regular text-xs leading-[1.1]">
              {currentUser ? (
                <>
                  <span className="font-semibold">{currentUser}님</span>
                  <button type="button" onClick={onLogout} className="cursor-pointer hover:text-[#1596b4]">
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={onLogin} className="cursor-pointer hover:text-[#1596b4]">
                    로그인
                  </button>
                  <button type="button" onClick={onSignup} className="cursor-pointer hover:text-[#1596b4]">
                    회원가입
                  </button>
                </>
              )}
            </div>
            <div className="flex items-end gap-5 font-roboto-regular text-[15px] leading-[1.1]">
              <a
                className="flex flex-col items-center gap-1.5 whitespace-nowrap cursor-pointer hover:text-[#1596b4]"
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  onMyPage?.();
                }}
              >
                <img className="h-9 w-[35px]" src={asset("3ab4a.svg")} alt="" />
                마이페이지
              </a>
              <a
                className="flex flex-col items-center gap-2 whitespace-nowrap cursor-pointer hover:text-[#1596b4]"
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  onReservations?.();
                }}
              >
                <img className="size-[30px] object-cover" src={asset("6a86e.png")} alt="" />
                예약 내역
              </a>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative border-b border-[#151515]"
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="mx-auto flex h-[45px] max-w-[1280px] items-center justify-between gap-6 px-5 md:px-10 lg:px-[100px]">
          <nav className="hidden h-full md:flex" aria-label="주요 메뉴">
            {["전체 메뉴", "테마 여행", "이용 안내"].map((label, index) => (
              <a
                className={`flex h-[45px] w-[155px] items-center justify-center gap-2 border-x-[0.8px] border-[#151515] px-3.5 font-roboto-regular text-[15px] leading-[1.1] text-[#111827] transition-colors ${
                  activeMenu === index ? "bg-[#1596b4] text-white" : "bg-white"
                }`}
                href="#"
                key={label}
                onFocus={() => setActiveMenu(index)}
                onMouseEnter={() => setActiveMenu(index)}
              >
                {index === 0 && (
                  <img className="size-[17px]" src={asset("8de09.svg")} alt="" />
                )}
                {label}
              </a>
            ))}
          </nav>

          <button
            className="flex h-[34px] items-center gap-2 border border-[#151515] bg-white px-3.5 font-roboto-regular text-[14px] md:hidden cursor-pointer"
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
          >
            <img className="size-4" src={asset("8de09.svg")} alt="" />
            전체 메뉴
          </button>

          <form
            className="flex h-[34px] w-[min(400px,58vw)] items-center gap-2.5 rounded-full border border-[#151515] bg-white px-3.5"
            onSubmit={(event) => {
              event.preventDefault();
              const query = new FormData(event.currentTarget)
                .get("travel-search")
                ?.toString()
                .trim();
              onSearch?.(query || "허니문");
            }}
          >
            <button
              className="flex h-5 shrink-0 items-center justify-center cursor-pointer"
              type="button"
              aria-label={isListening ? "음성 인식 중지" : "음성 검색 시작"}
              aria-pressed={isListening}
              onClick={() => setIsListening((listening) => !listening)}
            >
              {isListening ? (
                <div className="flex items-center gap-[2.5px] h-4 shrink-0 px-0.5" title="음성 인식 중...">
                  <span className="w-[2.5px] h-2 bg-[#171717] rounded-full animate-[bounce_0.8s_infinite_100ms]" />
                  <span className="w-[2.5px] h-4 bg-[#171717] rounded-full animate-[bounce_0.8s_infinite_300ms]" />
                  <span className="w-[2.5px] h-2.5 bg-[#171717] rounded-full animate-[bounce_0.8s_infinite_200ms]" />
                  <span className="w-[2.5px] h-3.5 bg-[#171717] rounded-full animate-[bounce_0.8s_infinite_400ms]" />
                </div>
              ) : (
                <img
                  className="h-[18.333px] w-[11.667px]"
                  src={asset("7629a.svg")}
                  alt="음성 검색"
                />
              )}
            </button>
            <label className="sr-only" htmlFor="travel-search">
              여행지 검색
            </label>
            <input
            className={`min-w-0 flex-1 bg-white font-roboto-regular text-[13px] text-black outline-none [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] [&::-webkit-search-cancel-button]:cursor-pointer [&::-webkit-search-cancel-button]:brightness-0 ${
              isListening ? "placeholder:text-[#1596b4] font-semibold" : "placeholder:text-[#8a8a8a]"
            }`}
            id="travel-search"
            name="travel-search"
            placeholder={isListening ? "음성 인식 중입니다..." : "여행지를 검색해 보세요"}
            type="search"
            defaultValue={searchValue}
            />
            <button type="submit" aria-label="검색" className="cursor-pointer">
              <img className="size-5" src={asset("8ce09.svg")} alt="" />
            </button>
          </form>
        </div>

        <div
          className={`absolute left-0 top-full w-full border-b border-black bg-white transition-[opacity,visibility] duration-150 z-40 ${
            activeMenu !== null
              ? "visible opacity-100"
              : "invisible pointer-events-none opacity-0"
          }`}
        >
          <div className="mx-auto h-[220px] max-w-[1280px] px-5 md:px-10 lg:px-[100px]">
            <div className="flex h-full border-t border-black font-roboto-regular text-sm leading-[1.1]">
              <div className="w-[155px] shrink-0" />
              {activeMenu === 0 || activeMenu === 1 ? (
                <div
                  className="flex h-full w-[155px] shrink-0 flex-col gap-3 border-x border-black px-3 py-4 bg-white"
                  onMouseEnter={() => setActiveMenu(activeMenu === 0 ? 0 : 1)}
                >
                  <span className="font-roboto-semibold text-[#1596b4]">
                    테마 여행
                  </span>
                  {themeMenuItems.map((item) => (
                    <a
                      className="text-[#888] transition-colors hover:text-black cursor-pointer"
                      href="#"
                      key={item.id}
                      onClick={(event) => {
                        event.preventDefault();
                        onTheme?.(item.id);
                        setActiveMenu(null);
                      }}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="w-[155px] shrink-0" />
              )}
              {(activeMenu === 0 || activeMenu === 2) && (
                <div
                  className={`flex h-full w-[155px] shrink-0 flex-col gap-3 border-r border-black px-3 py-4 bg-white ${
                    activeMenu === 2 ? "border-l" : ""
                  }`}
                  onMouseEnter={() => setActiveMenu(activeMenu === 0 ? 0 : 2)}
                >
                  <span className="font-roboto-semibold text-[#1596b4]">
                    이용 안내
                  </span>
                  {guideMenuItems.map((item) => (
                    <a
                      className="text-[#888] whitespace-nowrap transition-colors hover:text-black cursor-pointer"
                      href="#"
                      key={item}
                      onClick={(event) => {
                        event.preventDefault();
                        if (item === "예약 안내") {
                          onGuide?.("reservation");
                        } else if (item === "결제 안내") {
                          onGuide?.("payment");
                        } else if (item === "취소 / 환불" || item === "취소/환불") {
                          onGuide?.("cancel");
                        } else {
                          alert(`${item} 안내 준비 중입니다.`);
                        }
                        setActiveMenu(null);
                        setMobileOpen(false);
                      }}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="absolute left-0 top-full w-full border-b border-black bg-white p-5 md:hidden z-50 shadow-lg">
            <div className="grid grid-cols-2 gap-x-5 gap-y-6">
              <div>
                <span className="font-roboto-semibold text-sm text-[#1596b4]">
                  테마 여행
                </span>
                <div className="mt-3 flex flex-col gap-2 font-roboto-regular text-sm text-[#888]">
                  {themeMenuItems.map((item) => (
                    <a
                      href="#"
                      key={item.id}
                      className="hover:text-black transition-colors cursor-pointer"
                      onClick={(event) => {
                        event.preventDefault();
                        onTheme?.(item.id);
                        setMobileOpen(false);
                      }}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-roboto-semibold text-sm text-[#1596b4]">
                  이용 안내
                </span>
                <div className="mt-3 flex flex-col gap-2 font-roboto-regular text-sm text-[#888]">
                  {guideMenuItems.map((item) => (
                    <a
                      href="#"
                      key={item}
                      className="hover:text-black transition-colors cursor-pointer whitespace-nowrap"
                      onClick={(event) => {
                        event.preventDefault();
                        if (item === "예약 안내") {
                          onGuide?.("reservation");
                        } else if (item === "결제 안내") {
                          onGuide?.("payment");
                        } else if (item === "취소 / 환불" || item === "취소/환불") {
                          onGuide?.("cancel");
                        } else {
                          alert(`${item} 안내 준비 중입니다.`);
                        }
                        setMobileOpen(false);
                      }}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function TravelCard({ onSelect }: { onSelect: () => void }) {
  return (
    <button
      className="flex min-w-0 flex-col gap-2.5 text-left cursor-pointer group"
      type="button"
      onClick={onSelect}
    >
      <div className="overflow-hidden rounded-md">
        <img
          className="aspect-[225/200] w-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={asset("8a4c7.png")}
          alt="몰디브 아리 아톨 풀빌라"
        />
      </div>
      <p className="font-dot-regular text-base leading-[1.1] tracking-[-0.32px] text-[#1596b4] font-semibold">
        허니문
      </p>
      <p className="font-dot-regular text-xl leading-[1.1] tracking-[-0.4px] text-black">
        [몰디브] 아리 아톨 오버워터 풀빌라 6일
      </p>
      <p className="font-dot-semibold text-xl leading-[1.1] tracking-[-0.4px] text-black">
        3,890,000원~
      </p>
    </button>
  );
}

function MainContent({
  onProductSelect,
}: {
  onProductSelect: (product: SelectedProduct) => void;
}) {
  return (
    <main>
      <section className="relative flex h-[560px] items-center overflow-hidden">
        <img
          className="absolute inset-0 size-full object-cover"
          src={asset("bbfe6.png")}
          alt="그리스 산토리니의 해안 마을 풍경"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative mx-auto w-full max-w-[1280px] px-5 md:px-10 lg:px-[100px]">
          <h1 className="font-dot-regular text-[clamp(30px,3.5vw,46px)] leading-[1.2] tracking-[-0.96px] text-white">
            특별한 날,
            <br />
            가장 멋있는 장소에서
            <br />
            사랑하는 사람에게
            <br />
            <span className="font-bold text-[#c7e8ef]">잊지 못할 여행의 감동</span>을 선물하세요
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] bg-white px-5 py-16 md:px-10 lg:px-[100px]">
        <div className="border-y border-[#171717] bg-[#c7e8ef] px-6 py-[18px]">
          <h2 className="font-eb-semibold text-2xl text-[#111]">금주의 여행</h2>
          <p className="mt-1 font-dot-regular text-xs text-[#686868]">
            망설이지 말고 지금 예약하세요!
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 px-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[38px] lg:px-[30px]">
          {Array.from({ length: 4 }, (_, index) => (
            <TravelCard
              key={index}
              onSelect={() =>
                onProductSelect({
                  badge: "프리미엄",
                  country: "몰디브",
                  title: "아리 아톨 오버워터 풀빌라 6일",
                  duration: "4박 6일 · 항공 포함",
                  price: "3,890,000원~",
                  image: "cfca1.png",
                  theme: "honeymoon",
                  themeLabel: "허니문",
                })
              }
            />
          ))}
        </div>
      </section>

      <CustomerCenter />
    </main>
  );
}

function CustomerCenter() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 pb-[72px] pt-[80px] md:px-10 lg:px-[100px]">
      <div className="bg-[#f7f7f7] px-4 py-[38px] md:px-[30px] rounded-lg border border-[#e5e7eb]">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <h2 className="font-dot-semibold text-[28px] text-[#111]">
            고객센터
          </h2>
          <p className="font-dot-regular text-xs text-[#686868]">
            여행 준비부터 귀국까지, 미스터 월드가 함께합니다.
          </p>
        </div>
        <div className="mt-[30px] grid grid-cols-1 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {customerChannels.map(([title, number, hours], index) => (
            <div
              className={`flex flex-col gap-[7px] px-[18px] ${
                index > 0 ? "border-[#d9d9d9] lg:border-l" : ""
              }`}
              key={title}
            >
              <p className="font-dot-bold text-sm text-[#111]">{title}</p>
              <p className="font-eb-semibold text-[21px] text-[#1596b4]">
                {number}
              </p>
              <p className="font-dot-regular text-[11px] text-[#686868]">
                {hours}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#17212b] pb-8 pt-10 text-white">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10 lg:px-[100px]">
        <div className="flex flex-col gap-[20px]">
          <h2 className="font-eb-bold text-xl text-[#1596b4]">
            (주) 미스터월드 테마투어
          </h2>
          <div className="flex flex-col gap-1.5 font-roboto-regular text-xs text-[#9aa7b2]">
            <p>대표: 홍길동 | 개인정보보호책임자: 관리자</p>
            <p>주소: (02504) 서울특별시 동대문구 서울시립대로 163</p>
            <p>사업자등록번호: 204-81-00000 | 통신판매업신고: 제2026-서울동대문-0001호</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [targetReservationId, setTargetReservationId] = useState<string | null>(null);
  const [page, setPage] = useState<
    "home" | "signup" | "login" | "mypage" | "reservations" | "search" | "theme" | "detail" | "payment"
  >("home");
  const [activeTheme, setActiveTheme] = useState<ThemeId>("honeymoon");
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
  const [reservation, setReservation] = useState<ReservationSelection | null>(null);
  const [loginReturnPage, setLoginReturnPage] = useState<"home" | "detail" | "mypage" | "reservations">("home");
  const [registeredAccount, setRegisteredAccount] = useState<{
    username: string;
    password: string;
  } | null>(null);
  const [currentUser, setCurrentUser] = useState("");
  const [showTravelHistory, setShowTravelHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("허니문");
  const [activeGuide, setActiveGuide] = useState<GuideType | null>(null);

  const openProtectedPage = (destination: "mypage" | "reservations") => {
    if (currentUser) {
      setPage(destination);
      return;
    }
    setLoginReturnPage(destination);
    setPage("login");
  };

  const headerProps = {
    onHome: () => setPage("home"),
    onLogin: () => {
      setLoginReturnPage("home");
      setPage("login");
    },
    onSignup: () => setPage("signup"),
    onMyPage: () => openProtectedPage("mypage"),
    onReservations: () => openProtectedPage("reservations"),
    onSearch: (query: string) => {
      setSearchQuery(query);
      setPage("search");
      window.scrollTo({ top: 0 });
    },
    onTheme: (theme: ThemeId) => {
      setActiveTheme(theme);
      setPage("theme");
    },
    onGuide: (type: GuideType) => setActiveGuide(type), 
    searchValue: page === "search" ? searchQuery : undefined,
    currentUser,
    onLogout: () => {
      setShowTravelHistory(false);
      setCurrentUser("");
      setPage("home");
    },
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-black">
      {page !== "login" && page !== "signup" && <Header {...headerProps} />}

      {page === "home" && (
        <MainContent
          onProductSelect={(product) => {
            setSelectedProduct(product);
            setPage("detail");
            window.scrollTo({ top: 0 });
          }}
        />
      )}

      {page === "login" && (
        <CustomerLogin
          onHome={() => setPage("home")}
          onLoginSuccess={(email) => {
            setCurrentUser(email);

            const userHistory = reservations.filter(
              (res) => res.customer.email === email || res.customer.name === email
            );

            if (userHistory.length > 0) {
              setShowTravelHistory(true);
            } else {
              setShowTravelHistory(false);
            }

            setPage(loginReturnPage);
            setLoginReturnPage("home");
          }}
          onGoSignup={() => setPage("signup")}
        />
      )}

      {page === "signup" && (
        <CustomerSignup
          onHome={() => setPage("home")}
          onGoLogin={() => setPage("login")}
          onComplete={() => setPage("login")}
        />
      )}

      {page === "mypage" && <MyPage currentUser={currentUser} />}
      
      {page === "reservations" && (
        <ReservationHistoryPage
          reservations={reservations}
          initialSelectedId={targetReservationId}
          onCancelReservation={(resNo) => {
            setReservations((prev) =>
              prev.map((item) =>
                item.reservationNumber === resNo
                  ? {
                      ...item,
                      status: "취소",
                      statusDetail: "취소·환불 접수 완료",
                      refundStatus: "결제사 환불 처리 중",
                    }
                  : item
              )
            );
          }}
        />
      )}

      {page === "search" && (
        <div className="bg-white">
          <SearchResultsPage
            keyword={searchQuery}
            onProductSelect={(product) => {
              setSelectedProduct(product);
              setPage("detail");
              window.scrollTo({ top: 0 });
            }}
          />
          <CustomerCenter />
        </div>
      )}

      {page === "theme" && (
        <div className="bg-white">
          <ThemeTravelPage
            activeTheme={activeTheme}
            onThemeChange={(theme) => {
              setActiveTheme(theme);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onSearch={(query) => {
              setSearchQuery(query);
              setPage("search");
            }}
            onProductSelect={(product) => {
              setSelectedProduct(product);
              setPage("detail");
              window.scrollTo({ top: 0 });
            }}
          />
          <CustomerCenter />
        </div>
      )}

      {page === "detail" && selectedProduct && (
        <div className="bg-white">
          <ProductDetailPage
            product={selectedProduct}
            onReserve={(selection) => {
              if (!currentUser) {
                setLoginReturnPage("detail");
                setPage("login");
                return;
              }
              setReservation(selection);
              setPage("payment");
              window.scrollTo({ top: 0 });
            }}
          />
        </div>
      )}

      {page === "payment" && selectedProduct && reservation && currentUser && (
        <div className="bg-white">
          <PaymentPage
            product={selectedProduct}
            reservation={reservation}
            username={currentUser}
            onBack={() => {
              setPage("detail");
              window.scrollTo({ top: 0 });
            }}
            onPaymentSuccess={({ paymentMethod, finalPrice }) => {
              const minParticipants = selectedProduct.theme === "honeymoon" ? 2 : 3;
              const isConfirmed = reservation.people >= minParticipants;

              const newReservation: Reservation = {
                reservationNumber: `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}${Math.floor(100 + Math.random() * 900)}`,
                reservedAt: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/ /g, "").slice(0, -1),
                title: selectedProduct.title,
                dates: "2026.10.24 ~ 2026.10.29",
                details: `성인 ${reservation.people}명`,
                category: selectedProduct.themeLabel,
                departure: "인천 출발",
                totalPrice: finalPrice,
                status: isConfirmed ? "확정" : "대기",
                statusDetail: isConfirmed ? "예약금 결제 완료" : "담당자 확인 중",
                image: selectedProduct.image || "8a4c7.png",
                imageAlt: selectedProduct.title,
                customer: {
                  name: currentUser,
                  birthDate: "1994.05.18",
                  phone: "010-1234-5678",
                  email: `${currentUser}@misterworld.com`,
                },
                companions: Array.from({ length: Math.max(0, reservation.people - 1) }, (_, i) => ({
                  name: `동행자 ${i + 1}`,
                  relationship: "동행인",
                  birthDate: "1995.01.01",
                  passportName: `COMPANION ${i + 1}`,
                })),
                options: {
                  tourGrade: reservation.tourGrade,
                  hotel: reservation.hotel,
                  vehicle: reservation.vehicle,
                  meal: reservation.meal,
                  extras: reservation.additionalOptions.map((opt) => opt.label),
                },
                payment: {
                  method: paymentMethod,
                  paidAt: new Date().toLocaleString("ko-KR"),
                  basePrice: reservation.baseTotal,
                  optionPrice: reservation.extraPrice,
                  discountPrice: Math.floor(reservation.totalPrice * 0.01),
                },
              };

              setReservations((prev) => [newReservation, ...prev]);
              setPage("reservations");
              window.scrollTo({ top: 0 });
            }}
          />
        </div>
      )}

      <Footer />

      {showTravelHistory && (
        <TravelHistoryModal
          onClose={() => setShowTravelHistory(false)}
          onViewAll={() => {
            setShowTravelHistory(false);
            setTargetReservationId(null);
            setPage("reservations");
          }}
          onSelectHistory={(index) => {
            setShowTravelHistory(false);
            const matchedReservation = reservations[index] || reservations[0];
            if (matchedReservation) {
              setTargetReservationId(matchedReservation.reservationNumber);
            }
            setPage("reservations");
            window.scrollTo({ top: 0 });
          }}
        />
      )}

      {activeGuide && (
        <GuideModal
          type={activeGuide}
          onClose={() => setActiveGuide(null)}
        />
      )}
    </div>
  );
}

interface GuideModalProps {
  type: GuideType;
  onClose: () => void;
}

function GuideModal({ type, onClose }: GuideModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const guideData = {
    reservation: {
      title: "예약 안내",
      subtitle: "미스터 월드 테마 투어의 특별한 예약 시스템과 절차를 안내해 드립니다.",
      sections: [
        {
          heading: "1. 테마별 출발 확정 기준 인원",
          items: [
            "허니문 낭만 투어: 2인 전용 패키지로, 2인 결제 완료 시 즉시 예약 진행됩니다.",
            "효도 힐링 / 골프 챌린지 / 아웃도어 트레킹: 최소 3인 이상 신청 시 출발이 최종 확정됩니다.",
            "신청 인원이 기준 인원에 미달할 경우 모집 중 상태로 예약 접수가 유지됩니다.",
          ],
        },
        {
          heading: "2. 투어 등급 스타일 & 자유로운 옵션 변경",
          items: [
            "클래식 (Classic): 3성급 호텔 + 도시락 식사 제공",
            "그랜드 (Grand): 4성급 호텔 + 현지식 레스토랑 (※ 허니문/효도 투어는 그랜드 이상 선택 가능)",
            "프리미엄 (Premium): 5성급 호텔 + 고급 레스토랑 스테이크 & 샴페인 제공",
            "옵션 커스텀: 패키지 선택 후에도 숙소 등급, 차량, 식사 메뉴, 음료(샴페인/커피)를 자유롭게 개별 조정하실 수 있습니다.",
          ],
        },
        {
          heading: "3. 예약 진행 순서",
          items: [
            "여행 상품 선택 ➔ 투어 등급 및 옵션 구성 ➔ 예약자/여행자 정보 입력 ➔ 결제 진행 ➔ 기준 인원 충족 시 출발 확정 SMS 문자가 발송됩니다.",
          ],
        },
      ],
    },
    payment: {
      title: "결제 안내",
      subtitle: "안전하고 편리한 결제 수단 및 회원 혜택 적용 방법입니다.",
      sections: [
        {
          heading: "1. 이용 가능 결제 수단",
          items: [
            "신용 / 체크카드: 국내외 주요 전 카드사 지원 (일시불 및 무이자 할부 혜택 가능)",
            "실시간 계좌이체: 거래 은행 계좌를 통한 실시간 즉시 결제",
            "가상계좌 발급: 지정된 가상계좌로 유효 시간 내 입금 완료 시 결제 처리",
          ],
        },
        {
          heading: "2. 단골 회원 등급 자동 할인",
          items: [
            "최근 1년간의 여행 이용 실적을 기반으로 회원 등급(일반/실버/골드)이 자동 산정됩니다.",
            "결제 시 회원 등급에 따른 할인 금액(1% ~ 5%)이 주문 합계 금액에서 자동으로 즉시 차감 반영됩니다.",
          ],
        },
        {
          heading: "3. 결제 후 진행 과정",
          items: [
            "결제 직후에는 예약 '대기' 상태로 접수됩니다.",
            "모집 마감일 이전 최소 출발 인원이 채워지면 담당자 확인 후 '확정' 상태로 전환되며 알림 문자가 전송됩니다.",
          ],
        },
      ],
    },
    cancel: {
      title: "취소 / 환불 안내",
      subtitle: "예약 취소 신청 및 환불 규정에 관한 상세 안내입니다.",
      sections: [
        {
          heading: "1. 취소 가능 기간 및 신청 방법",
          items: [
            "모집 마감일 이전: [마이페이지] > [예약 내역]에서 언제든지 직접 취소 및 환불 접수가 가능합니다.",
            "모집 마감일 이후: 출발 준비가 시작되어 시스템 취소가 불가하므로 고객센터(1588-2200)로 문의해 주셔야 합니다.",
          ],
        },
        {
          heading: "2. 예약 취소에 따른 모집 상태 연동",
          items: [
            "출발 확정된 상품이라도 모집 마감일 전 취소로 인해 잔여 인원이 기준 인원(3인/허니문 2인) 미만으로 떨어지면, 해당 상품은 자동으로 '모집 중' 상태로 전환됩니다.",
          ],
        },
        {
          heading: "3. 환불 처리 기간",
          items: [
            "신용카드: 취소 승인 완료 후 카드사 영업일 기준 3~5일 이내 환불/승인 취소가 반영됩니다.",
            "계좌이체 / 가상계좌: 취소 접수 후 환불 계좌 확인을 거쳐 1~2 영업일 이내 입금 처리됩니다.",
          ],
        },
      ],
    },
  }[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[calc(100dvh-32px)] w-full max-w-[560px] flex-col overflow-hidden rounded-xl border border-[#dde4e8] bg-white shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex min-h-[56px] items-center justify-between border-b border-[#171717] bg-[#c7e8ef] px-6">
          <h2 className="font-eb-semibold text-lg font-semibold text-[#111]">
            {guideData.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-lg text-[#65717e] transition-colors hover:bg-black/10 hover:text-black cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="font-dot-regular text-xs text-[#65717e] border-b border-[#dde4e8] pb-3">
            {guideData.subtitle}
          </p>

          <div className="space-y-5">
            {guideData.sections.map((sec, idx) => (
              <section key={idx} className="rounded-lg border border-[#dde4e8] bg-[#f8fafb] p-4 space-y-2.5">
                <h3 className="font-dot-bold text-sm text-[#1596b4]">
                  {sec.heading}
                </h3>
                <ul className="space-y-1.5 font-dot-regular text-[13px] leading-[1.6] text-[#374151]">
                  {sec.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2">
                      <span className="shrink-0 text-[#374151]">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="rounded bg-[#eaf7f9] p-3 text-center font-dot-regular text-xs text-[#1596b4]">
            추가 문의 사항은 고객센터 <strong>1588-2200</strong>으로 문의해 주세요.
          </div>
        </div>

        <div className="border-t border-[#dde4e8] bg-white p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-md bg-[#1596b4] font-dot-semibold text-sm text-white transition-colors hover:bg-[#117a93] cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}