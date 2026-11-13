export const assetPathPrefix = "/assets";
export const assets = {
  logo: `${assetPathPrefix}/5e724.png`,
  search: `${assetPathPrefix}/8ce09.svg`,
  signupArrow: `${assetPathPrefix}/657d6.svg`,
  signupMenu: `${assetPathPrefix}/8de09.svg`,
  signupPerson: `${assetPathPrefix}/8710a.svg`,
  signupReservation: `${assetPathPrefix}/6a86e.png`,
  person: `${assetPathPrefix}/9d52d.svg`,
  chevron: `${assetPathPrefix}/bcc57.svg`,
  menu: `${assetPathPrefix}/af784.svg`,
  check: `${assetPathPrefix}/f6f5a.svg`,
  dropdown: `${assetPathPrefix}/98bff.svg`,
  filterDropdown: `${assetPathPrefix}/c8e92.svg`,
  more: `${assetPathPrefix}/d363d.svg`,
  arrowLeft: `${assetPathPrefix}/10fce.svg`,
};

export type AdminSection = "products" | "reservations" | "inventory";

export type Product = {
  name: string;
  theme: string;
  country: string;
  grades: string;
  price: string;
  options: string;
  status: string;
  date: string;
  duration: string;
  customAddOns?: Array<{ enabled: boolean; type: string; name: string; price: string; rule: string }>;
  customDrinks?: Array<{ enabled: boolean; name: string; price: string }>;
};

export type Reservation = {
  id: string;
  code: string;
  product: string;
  schedule: string;
  customer: string;
  phone: string;
  people: number;
  grade: string;
  hotel: string;
  meal: string;
  drink: string;
  souvenir: string;
  amount: string;
  status: string;
  bookedAt: string;
};

export type InventoryItem = {
  name: string;
  base: number;
  inbound: number;
  outbound: number;
  current: number;
  lastUpdated: string;
};

export type InventoryHistory = {
  date: string;
  type: "입고" | "출고";
  item: string;
  quantity: number;
  stockAfter: number;
  reason: string;
};
