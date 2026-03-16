import { z } from "zod";

export const quoteSchema = z.object({
  productId: z.string().min(1),
  customerName: z.string().min(2).max(80),
  customerEmail: z.union([z.string().email(), z.literal("")]).optional().default(""),
  phone: z.string().min(10).max(20),
  cep: z.string().max(10).optional().default(""),
  neighborhood: z.string().min(2).max(80),
  distanceKm: z.coerce.number().min(0).max(200).optional().default(0),
  colorPreference: z.string().min(2).max(50),
  paymentMethod: z.enum(["pix", "cartao", "boleto"]),
  notes: z.string().max(400).optional().default("")
});

export const calculatorSchema = z.object({
  grams: z.coerce.number().min(5).max(1000),
  hours: z.coerce.number().min(0.3).max(72),
  complexity: z.coerce.number().min(0.8).max(2),
  paymentMethod: z.enum(["pix", "cartao", "boleto"]).default("pix"),
  channel: z.enum(["site", "mercadolivre", "shopee", "whatsapp"]).default("site")
});
