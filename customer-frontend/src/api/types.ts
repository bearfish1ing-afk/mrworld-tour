// 백엔드 DTO와 1:1로 맞춘 타입 (src/main/java/.../*Dto.java, *Response.java)

// ---- 인증 (AuthDto, SmsDto) ----
export type SignupRequest = {
  email: string;
  password: string;
  phoneNum: string;
  name: string;
  nickname?: string | null;
  address: string;
  signupProof: string;
};

export type SignupResponse = { userId: number; message: string };

export type LoginRequest = { email: string; password: string };

export type LoginResponse = { accessToken: string; tokenType: string; expiresIn: number };

export type SmsSendResponse = { requestId: string; expiresIn: number; resendAfter: number };

export type SmsVerifyResponse = { signupProof: string; expiresIn: number };

// ---- 회원 (UserResponse) ----
export type UserLevel = "BRONZE" | "SILVER" | "GOLD";

export type UserResponse = {
  id: number;
  email: string;
  phoneNum: string;
  name: string;
  nickname: string | null;
  address: string;
  createdAt: string;
  level: UserLevel;
  role: "ADMIN" | "USER";
};

// ---- 상품 (ProductDto) ----
export type ProductStatus = "RECRUITING" | "CONFIRMED" | "CLOSED" | "CANCELED" | "COMPLETED";
export type TravelGrade = "CLASSIC" | "GRAND" | "PREMIUM";
export type VehicleType = "COUPLE_LUXURY" | "VAN_10_LUXURY" | "PRIVATE_LIMOUSINE";
export type HotelLevel = "STAR_3" | "STAR_4" | "STAR_5";
export type MealType = "LUNCHBOX" | "LOCAL_RESTAURANT" | "FINE_DINING";
export type ProductOptionType = "HOTEL" | "MEAL" | "VEHICLE" | "DRINK";
// 여행 지역(대륙) - 관리자가 상품 등록 시 선택
export type ProductRegion = "DOMESTIC" | "ASIA" | "EUROPE" | "AMERICA" | "OCEANIA" | "AFRICA";

export type ThemeResponse = {
  id: number;
  name: string;
  description: string | null;
  defaultVehicle: VehicleType | null;
  minGrade: TravelGrade | null;
  fixedPeople: number | null;
};

export type ProductSummary = {
  id: number;
  productCode: string;
  title: string;
  country: string;
  region: ProductRegion | null;
  duration: string | null;
  basePrice: number;
  status: ProductStatus;
  departureDate: string; // yyyy-MM-dd
  returnDate: string;
  deadline: string; // yyyy-MM-ddTHH:mm:ss
  maxPeople: number;
  currentPeople: number;
  theme: ThemeResponse | null;
};

export type ProductPage = {
  content: ProductSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type GradeResponse = {
  id: number;
  grade: string; // "CLASSIC" 또는 "클래식" 형태
  extraPrice: number;
  defaultGrade: boolean;
  defaultHotelOptionId: number | null;
  defaultMealOptionId: number | null;
  defaultDrinkOptionId: number | null;
};

export type OptionResponse = {
  id: number;
  optionType: ProductOptionType;
  optionName: string | null;
  extraPrice: number;
  applyRule: "PER_PERSON" | "PER_RESERVATION" | null;
  hotelLevel: HotelLevel | null;
  hotelRating: number | null;
  vehicleType: VehicleType | null;
  mealType: MealType | null;
  serviceLevel: number | null;
};

export type ProductDetail = {
  product: ProductSummary;
  description: string | null;
  minPeople: number;
  grades: GradeResponse[];
  options: OptionResponse[];
  hotels: OptionResponse[];
  vehicles: OptionResponse[];
  defaultVehicleOptionId: number | null;
};

export type ProductSearchParams = {
  themeId?: number;
  region?: ProductRegion;
  departureFrom?: string;
  departureTo?: string;
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
  page?: number;
  size?: number;
};

// ---- 음성 검색 (VoiceSearchDto) ----
export type VoiceSearchResponse = {
  filters: {
    themeId: number | null;
    departureFrom: string | null;
    departureTo: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    keyword: string | null;
  };
  results: ProductPage;
};

// ---- 예약 (reservation 패키지) ----
export type ReservationOptionType = "GRADE" | "HOTEL" | "MEAL" | "VEHICLE" | "DRINK" | "ETC";
export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELED";

export type DrinkRequest = { optionId: number; quantity: number };

export type PriceRequest = {
  productId: number;
  productGradeId: number;
  people: number;
  hotelOptionId?: number | null;
  mealOptionId?: number | null;
  vehicleOptionId?: number | null;
  drinks?: DrinkRequest[];
};

export type PriceItem = {
  type: ReservationOptionType;
  sourceId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  isDefault: boolean;
};

export type PriceResponse = {
  baseAmount: number;
  items: PriceItem[];
  optionAmount: number;
  discountAmount: number;
  finalAmount: number;
};

export type ReservationCreateRequest = PriceRequest & { paymentMethod: string };

export type ReservationCreateResponse = {
  reservationId: number;
  reservationCode: string;
  status: ReservationStatus;
  finalAmount: number;
};

export type ReservationListItem = {
  reservationId: number;
  reservationCode: string;
  productId: number;
  productTitle: string;
  departureDate: string;
  returnDate: string;
  grade: string;
  people: number;
  finalAmount: number;
  status: ReservationStatus;
  reservedAt: string;
};

export type ReservationDetail = {
  reservationId: number;
  reservationCode: string;
  status: ReservationStatus;
  reservedAt: string;
  people: number;
  productId: number;
  productTitle: string;
  departureDate: string;
  returnDate: string;
  grade: string;
  vehicle: string | null;
  options: {
    type: ReservationOptionType;
    productOptionId: number | null;
    name: string;
    quantity: number;
    amount: number;
    isDefault: boolean;
  }[];
  baseAmount: number;
  optionAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string | null;
};
