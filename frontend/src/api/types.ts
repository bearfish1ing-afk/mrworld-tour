// 백엔드 응답/요청 형식 (feature/voice-feedback 기준)

export type TravelGrade = "CLASSIC" | "GRAND" | "PREMIUM";
export type ProductStatus = "RECRUITING" | "CONFIRMED" | "CLOSED" | "CANCELED" | "COMPLETED";
export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELED";
export type OptionType = "HOTEL" | "MEAL" | "VEHICLE" | "DRINK";
export type HotelLevel = "STAR_3" | "STAR_4" | "STAR_5";
export type MealType = "LUNCHBOX" | "LOCAL_RESTAURANT" | "FINE_DINING";
export type VehicleType = "COUPLE_LUXURY" | "VAN_10_LUXURY" | "PRIVATE_LIMOUSINE";
export type StockChangeType = "RECEIVE" | "ALLOCATE" | "RESTORE";

export type Page<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

// ---------- 인증 ----------
export type LoginResponse = { accessToken: string; tokenType: string; expiresIn: number };
export type SmsSendResponse = { requestId: string; expiresIn?: number; resendAfter?: number };
export type SmsVerifyResponse = { signupProof: string };
export type SignupRequest = {
  email: string;
  password: string;
  phoneNum: string;
  name: string;
  nickname: string | null;
  address: string;
  signupProof: string;
};

// ---------- 상품 ----------
export type ThemeResponse = {
  id: number;
  name: string;
  description: string;
  defaultVehicle: VehicleType | null;
  minGrade: TravelGrade | null;
  fixedPeople: number | null;
};

export type ProductSummary = {
  id: number;
  productCode: string;
  title: string;
  country: string;
  duration: string | null;
  basePrice: number;
  status: ProductStatus;
  departureDate: string;
  returnDate: string;
  deadline: string;
  maxPeople: number;
  currentPeople: number;
  theme: ThemeResponse | null;
};

export type GradeResponse = {
  id: number;
  grade: TravelGrade;
  extraPrice: number;
  defaultGrade: boolean;
  defaultHotelOptionId: number | null;
  defaultMealOptionId: number | null;
  defaultDrinkOptionId: number | null;
};

export type OptionResponse = {
  id: number;
  optionType: OptionType;
  optionName: string;
  extraPrice: number;
  applyRule: string;
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

export type OptionCreateRequest =
  | { optionType: "HOTEL"; hotelLevel: HotelLevel; extraPrice: number }
  | { optionType: "MEAL"; mealType: MealType; extraPrice: number }
  | { optionType: "VEHICLE"; vehicleType: VehicleType; extraPrice: number }
  | { optionType: "DRINK"; optionName: string; extraPrice: number; applyRule: "PER_PERSON" | "PER_RESERVATION" };

export type ProductCreateRequest = {
  themeId: number;
  productCode: string;
  title: string;
  country: string;
  duration: string;
  description: string;
  basePrice: number;
  status: ProductStatus;
  departureDate: string;
  returnDate: string;
  deadline: string;
  maxPeople: number;
  minPeople: number;
  options: OptionCreateRequest[];
  grades: Array<{ grade: TravelGrade; extraPrice: number; defaultGrade: boolean }>;
};

// ---------- 예약 (관리자) ----------
export type ReservationSummary = {
  reservationId: number;
  reservationCode: string;
  productId: number;
  productTitle: string | null;
  departureDate: string | null;
  returnDate: string | null;
  customerName: string | null;
  customerPhone: string | null;
  people: number;
  grade: string | null;
  finalAmount: number;
  status: ReservationStatus;
  reservedAt: string;
};

export type ReservationOption = {
  type: "GRADE" | OptionType | "ETC";
  productOptionId: number | null;
  name: string;
  quantity: number;
  amount: number;
  isDefault: boolean;
};

export type ReservationDetail = {
  summary: ReservationSummary;
  vehicle: string | null;
  options: ReservationOption[];
  souvenirName: string | null;
  souvenirQuantity: number;
  baseAmount: number;
  optionAmount: number;
  discountAmount: number;
  paymentMethod: string | null;
  adminMemo: string | null;
};

export type ReservationChangeRequest = {
  productGradeId?: number | null;
  people?: number | null;
  hotelOptionId?: number | null;
  mealOptionId?: number | null;
  vehicleOptionId?: number | null;
  drinks?: Array<{ optionId: number; quantity: number }> | null;
};

// ---------- 재고 ----------
export type Item = {
  id: number;
  itemName: string;
  baseAmount: number; // 물품 1개 가격(원)
  currentAmount: number;
  updatedAt: string;
};

export type StockHistory = {
  id: number;
  itemId: number;
  reservationId: number | null;
  type: StockChangeType;
  quantity: number;
  stockAfter: number;
  reason: string | null;
  createdAt: string;
};
