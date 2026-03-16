export type MemberIdentity = {
  id?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type SavedQuote = {
  quoteId: string;
  productId: string;
  productName: string;
  pricePix: number;
  estimatedDeliveryFee: number;
  totalPix: number;
  paymentMethod: string;
  createdAt: string;
};

const FAVORITES_KEY = "mdh:favorites";
const QUOTES_KEY = "mdh:quotes";
const DEVICE_KEY = "mdh:device";

function hasWindow() {
  return typeof window !== "undefined";
}

function readStore<T>(key: string): Record<string, T[]> {
  if (!hasWindow()) return {};

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, T[]>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore<T>(key: string, value: Record<string, T[]>) {
  if (!hasWindow()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("mdh:member-store"));
}

export function getDeviceKey() {
  if (!hasWindow()) return "device";

  const current = window.localStorage.getItem(DEVICE_KEY);
  if (current) return current;

  const next = `device-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(DEVICE_KEY, next);
  return next;
}

export function getMemberKey(identity?: MemberIdentity | null) {
  if (identity?.id) return identity.id;
  if (identity?.email) return identity.email.toLowerCase();
  if (identity?.phone) return identity.phone;
  return getDeviceKey();
}

export function getDisplayName(identity?: MemberIdentity & { fullName?: string | null }) {
  if (identity?.fullName?.trim()) return identity.fullName.trim();
  if (identity?.email) return identity.email.split("@")[0];
  if (identity?.phone) return identity.phone;
  return "cliente";
}

export function listFavorites(memberKey: string) {
  const favorites = readStore<string>(FAVORITES_KEY);
  return favorites[memberKey] || favorites[getDeviceKey()] || [];
}

export function toggleFavorite(memberKey: string, productId: string) {
  const favorites = readStore<string>(FAVORITES_KEY);
  const current = new Set(favorites[memberKey] || []);

  if (current.has(productId)) {
    current.delete(productId);
  } else {
    current.add(productId);
  }

  favorites[memberKey] = Array.from(current);
  writeStore(FAVORITES_KEY, favorites);
  return favorites[memberKey];
}

export function listSavedQuotes(memberKey: string) {
  const quotes = readStore<SavedQuote>(QUOTES_KEY);
  const memberQuotes = quotes[memberKey] || [];
  const deviceQuotes = memberKey === getDeviceKey() ? [] : quotes[getDeviceKey()] || [];

  return [...memberQuotes, ...deviceQuotes].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function saveQuote(memberKey: string, quote: SavedQuote) {
  const quotes = readStore<SavedQuote>(QUOTES_KEY);
  const current = quotes[memberKey] || [];
  quotes[memberKey] = [quote, ...current].slice(0, 12);
  writeStore(QUOTES_KEY, quotes);
  return quotes[memberKey];
}
