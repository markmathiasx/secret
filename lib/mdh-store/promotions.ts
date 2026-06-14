export type SmartStoreCoupon = {
  code: string;
  title: string;
  description: string;
  type: "percent" | "fixed" | "bundle" | "shipping";
  value: number;
  minSubtotal?: number;
  appliesTo: string[];
  badge: string;
};

export const smartStoreCoupons: SmartStoreCoupon[] = [
  {
    code: "PRIMEIRAMDH",
    title: "Primeira compra",
    description: "Cupom local para abrir conversa de primeira compra pelo WhatsApp.",
    type: "percent",
    value: 10,
    minSubtotal: 30,
    appliesTo: ["Todos os produtos locais"],
    badge: "10% off",
  },
  {
    code: "PIXMDH",
    title: "Desconto para Pix",
    description: "Use o cupom como argumento comercial para pagamento via Pix no atendimento.",
    type: "fixed",
    value: 5,
    minSubtotal: 50,
    appliesTo: ["Presentes", "Setup", "Organização"],
    badge: "R$ 5 off",
  },
  {
    code: "BRINDESRJ",
    title: "Brindes em lote",
    description: "Condição local para pedidos com quantidade e personalização de marca.",
    type: "percent",
    value: 12,
    minSubtotal: 150,
    appliesTo: ["Brindes em lote", "Chaveiros", "Empresas"],
    badge: "lote",
  },
  {
    code: "LEVE3",
    title: "Combo leve 3",
    description: "Promoção tipo leve 3 pague 2 para itens pequenos combinados no WhatsApp.",
    type: "bundle",
    value: 1,
    minSubtotal: 20,
    appliesTo: ["Chaveiros", "Presentes baratos"],
    badge: "3 por 2",
  },
  {
    code: "FRETEGRATISRJ",
    title: "Frete/retirada combinados",
    description: "Condição para orçamento com retirada local ou envio combinado no Rio de Janeiro.",
    type: "shipping",
    value: 0,
    minSubtotal: 120,
    appliesTo: ["RJ", "Pedidos locais"],
    badge: "RJ",
  },
];

export const FREE_SHIPPING_THRESHOLD = 120;

export function estimateCouponDiscount(coupon: SmartStoreCoupon, subtotal: number) {
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return 0;
  if (coupon.type === "percent") return subtotal * (coupon.value / 100);
  if (coupon.type === "fixed") return Math.min(subtotal, coupon.value);
  if (coupon.type === "bundle") return 0;
  return 0;
}
