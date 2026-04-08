import { formatCep } from "@/lib/shipping";

export const CHECKOUT_DRAFT_KEY = "mdh_checkout_draft_v2";
export const PURPOSE_OPTIONS = ["Uso próprio", "Presente", "Lote", "Revenda"] as const;
export const CHECKOUT_STEPS = ["Endereço", "Envio", "Pagamento", "Confirmação"] as const;
export const PAYMENT_STATUS: Record<string, string> = {
  success: "Pagamento aprovado. Assim que a confirmação chegar, o pedido entra na fila de produção.",
  pending: "Pagamento em análise. Se estiver no cartão, o parceiro ainda está processando a autorização.",
  failure: "O pagamento não foi concluído. Você pode tentar novamente ou seguir no Pix ou boleto.",
};

export type PurchasePurpose = (typeof PURPOSE_OPTIONS)[number];

export type AddressBookItem = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  zipCode: string;
  line1: string;
  line2: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

export type CheckoutAddress = {
  label: string;
  recipientName: string;
  phone: string;
  zipCode: string;
  line1: string;
  line2: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

export type CheckoutDraft = {
  productId: string;
  quantity: number;
  purchasePurpose: PurchasePurpose;
  customerName: string;
  email: string;
  phone: string;
  notes: string;
  addressMode: "saved" | "new";
  selectedAddressId: string;
  saveAddress: boolean;
  address: CheckoutAddress;
  paymentMethod: "pix" | "cartao" | "boleto";
  selectedShippingId: "standard" | "express";
};

export function createEmptyAddress(): CheckoutAddress {
  return {
    label: "Principal",
    recipientName: "",
    phone: "",
    zipCode: "",
    line1: "",
    line2: "",
    neighborhood: "",
    city: "Rio de Janeiro",
    state: "RJ",
    country: "BR",
    isDefaultShipping: true,
    isDefaultBilling: true,
  };
}

export function readCheckoutDraft(): CheckoutDraft | null {
  if (typeof window === "undefined") return null as CheckoutDraft | null;

  try {
    const raw = window.localStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CheckoutDraft>;
    if (!parsed || typeof parsed !== "object") return null;

    return {
      productId: typeof parsed.productId === "string" ? parsed.productId : "",
      quantity: Number(parsed.quantity) || 1,
      purchasePurpose: PURPOSE_OPTIONS.includes(parsed.purchasePurpose as PurchasePurpose)
        ? (parsed.purchasePurpose as PurchasePurpose)
        : "Uso próprio",
      customerName: typeof parsed.customerName === "string" ? parsed.customerName : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
      addressMode: parsed.addressMode === "saved" ? "saved" : "new",
      selectedAddressId: typeof parsed.selectedAddressId === "string" ? parsed.selectedAddressId : "",
      saveAddress: parsed.saveAddress !== false,
      address: {
        ...createEmptyAddress(),
        ...(parsed.address && typeof parsed.address === "object" ? parsed.address : {}),
      },
      paymentMethod:
        parsed.paymentMethod === "cartao" || parsed.paymentMethod === "boleto"
          ? parsed.paymentMethod
          : "pix",
      selectedShippingId: parsed.selectedShippingId === "express" ? "express" : "standard",
    };
  } catch {
    return null;
  }
}

export function normalizeCheckoutAddress(address: CheckoutAddress, fallbackName: string, fallbackPhone: string) {
  return {
    ...address,
    recipientName: (address.recipientName || fallbackName).trim(),
    phone: (address.phone || fallbackPhone).trim(),
    zipCode: formatCep(address.zipCode).replace(/\D/g, ""),
    line1: address.line1.trim(),
    line2: address.line2.trim(),
    neighborhood: address.neighborhood.trim(),
    city: address.city.trim(),
    state: address.state.trim().toUpperCase(),
    country: address.country.trim().toUpperCase() || "BR",
  };
}
